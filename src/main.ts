import dotenv from 'dotenv';
dotenv.config();

import readline from 'readline';
import { Pool } from 'pg';
import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { ToolRegistry } from './registry';
import { ToolDefinition } from './types';
import { generateEmbedding, initializeEmbeddingModel } from './embedding';
import { demoTools } from './tools';
import { getSharedMemory } from './memory';
const toolRegistry = new ToolRegistry();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let pool: Pool | null = null;

/**
 * Initializes the PostgreSQL database connection and creates required tables.
 * Sets up the vector extension and tool_embeddings table with vector search index.
 */
async function initDatabase(): Promise<void> {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL environment variable is not set. ' +
                'Please set it to your PostgreSQL connection string.'
            );
        }

        pool = new Pool({
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle PostgreSQL client', err);
            process.exit(-1);
        });

        console.log('✓ PostgreSQL connection pool created');
    }

    await pool.connect();
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');

    await pool.query(`
    CREATE TABLE IF NOT EXISTS tool_embeddings (
      id SERIAL PRIMARY KEY,
      tool_id VARCHAR(255) UNIQUE NOT NULL,
      tool_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      keywords TEXT[] NOT NULL,
      parameters JSONB NOT NULL,
      tool_definition JSONB NOT NULL,
      embedding vector(384) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS tool_embeddings_vector_idx
    ON tool_embeddings USING ivfflat (embedding vector_cosine_ops);
  `);
}

/**
 * Finds relevant tools using vector similarity search.
 * @param userPrompt - The user's query text
 * @param topK - Maximum number of tools to return
 * @param similarityThreshold - Minimum similarity score (0-1)
 * @returns Array of tool IDs with their similarity scores
 */
async function findRelevantTools(
    userPrompt: string,
    topK: number = 5,
    similarityThreshold: number = 0.7
): Promise<Array<{ id: string; similarity: number }>> {
    const queryEmbedding = await generateEmbedding(userPrompt);

    const result = await pool?.query(
        `SELECT
       tool_id,
       tool_name,
       description,
       1 - (embedding <=> $1::vector) as similarity
     FROM tool_embeddings
     WHERE 1 - (embedding <=> $1::vector) > $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
        [`[${queryEmbedding.join(',')}]`, similarityThreshold, topK]
    );

    return result!.rows.map((row) => ({
        id: row.tool_id,
        similarity: row.similarity,
    }));
}

/**
 * Registers a tool in the database with its embedding.
 * @param tool - The tool definition to register
 */
async function registerTool(tool: ToolDefinition): Promise<void> {
    const searchableText = `
    ${tool.name}
    ${tool.description}
    ${tool.keywords.join(' ')}
  `.trim();

    const embedding = await generateEmbedding(searchableText);

    await pool?.query(
        `INSERT INTO tool_embeddings
     (tool_id, tool_name, description, keywords, parameters, tool_definition, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tool_id) DO UPDATE SET
       tool_name = $2,
       description = $3,
       keywords = $4,
       parameters = $5,
       tool_definition = $6,
       embedding = $7`,
        [
            tool.id,
            tool.name,
            tool.description,
            tool.keywords,
            JSON.stringify(tool.parameters.shape),
            JSON.stringify({
                id: tool.id,
                name: tool.name,
                description: tool.description,
                keywords: tool.keywords,
            }),
            `[${embedding.join(',')}]`,
        ]
    );
}

/**
 * Sets up all demo tools by registering them in both the registry and database.
 */
async function setupTools(): Promise<void> {
    for (const tool of demoTools) {
        toolRegistry.register(tool);
        await registerTool(tool);
        console.log(`✓ Registered: ${tool.name}`);
    }
}

/**
 * Creates a dynamic agent with the specified tools.
 * @param tools - Array of tool definitions to make available to the agent
 * @returns Configured Agent instance
 */
async function createDynamicAgent(tools: ToolDefinition[]): Promise<Agent> {
    const mastraTools = tools.map((tool) =>
        createTool({
            id: tool.id,
            description: tool.description,
            inputSchema: tool.parameters,
            execute: async ({ context }) => {
                return await tool.execute(context);
            },
        })
    );

    const memory = await getSharedMemory();
    const agent = new Agent({
        name: 'Dynamic Agent',
        instructions: `You are a helpful assistant with access to specific tools.
        Use the best tools depending on prompt.
        You have the ability to remember chat history, past conversations and internal states.
        Make sure you are able to remember and differentiate between what you said and what the user said, do not confuse the two.
        `,
        model: 'google/gemini-2.0-flash',
        tools: Object.fromEntries(mastraTools.map((tool) => [tool.id, tool])),
        memory,
    });

    return agent;
}

/**
 * Handles a user prompt by finding relevant tools and generating a response.
 * @param userID - Unique identifier for the user
 * @param prompt - The user's input prompt
 * @param pastTools - Array of tools used in previous prompts (accumulates over time)
 */
async function handlePrompt(
    userID: string,
    prompt: string,
    pastTools: ToolDefinition[]
): Promise<void> {
    try {
        const tools = await findRelevantTools(prompt, 3, 0.6);
        const relevantTools = toolRegistry.getMultiple(tools.map((t) => t.id));
        const mergedTools = [
            ...new Map(
                [...pastTools, ...relevantTools].map((t) => [t.id, t])
            ).values(),
        ];

        pastTools.splice(0, pastTools.length, ...mergedTools);

        const agent = await createDynamicAgent(pastTools);
        console.log(
            'Total tools available to agent:',
            pastTools.map((t) => t.name).join(', ')
        );

        const result = await agent.generate(prompt, {
            memory: {
                resource: userID,
                thread: 'default',
            },
        });

        console.log(result.text);
    } catch (error) {
        console.error('Error handling request:', error);
        throw error;
    }
}

/**
 * Main application entry point.
 * Initializes the system and starts the interactive prompt loop.
 */
async function main(): Promise<void> {
    await initializeEmbeddingModel();
    await initDatabase();
    await setupTools();
    console.log('All tools registered and database initialized.');

    const userID = 'user1';
    const pastTools: ToolDefinition[] = [];

    while (true) {
        const text: string = await new Promise((resolve) =>
            rl.question('> ', resolve)
        );
        if (text.trim().toLowerCase() === 'exit') {
            break;
        }
        await handlePrompt(userID, text, pastTools);
    }

    rl.close();
    process.exit(0);
}

main();