import { Pool } from 'pg';
import { ToolDefinition } from './types';
import { generateEmbedding } from './embedding';
import { config } from './config';

let pool: Pool | null = null;

/**
 * Initializes the PostgreSQL database connection and creates required tables.
 * Sets up the vector extension and tool_embeddings table with vector search index.
 */
export async function initDatabase(): Promise<void> {
    if (!pool) {
        pool = new Pool({
            connectionString: config.database.url,
            max: config.database.maxConnections,
            idleTimeoutMillis: config.database.idleTimeoutMs,
            connectionTimeoutMillis: config.database.connectionTimeoutMs,
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
 * Gets the database connection pool.
 * @returns The PostgreSQL connection pool
 * @throws Error if database is not initialized
 */
export function getPool(): Pool {
    if (!pool) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return pool;
}

/**
 * Finds relevant tools using vector similarity search.
 * @param userPrompt - The user's query text
 * @param topK - Maximum number of tools to return
 * @param similarityThreshold - Minimum similarity score (0-1)
 * @returns Array of tool IDs with their similarity scores
 */
export async function findRelevantTools(
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
export async function registerToolInDatabase(tool: ToolDefinition): Promise<void> {
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
 * Closes the database connection pool.
 */
export async function closeDatabase(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✓ Database connection pool closed');
    }
}