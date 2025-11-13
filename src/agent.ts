import { createTool } from '@mastra/core/tools';
import { Agent } from '@mastra/core/agent';
import { ToolDefinition } from './types';
import { getSharedMemory } from './memory';
import { config } from './config';

/**
 * Creates a dynamic agent with the specified tools.
 * @param tools - Array of tool definitions to make available to the agent
 * @returns Configured Agent instance
 */
export async function createDynamicAgent(tools: ToolDefinition[]): Promise<Agent> {
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
        name: config.agent.name,
        instructions: config.agent.instructions,
        model: config.agent.model,
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
 * @param findRelevantTools - Function to find relevant tools based on the prompt
 * @param toolRegistry - Tool registry instance to retrieve tools
 */
export async function handlePrompt(
    userID: string,
    prompt: string,
    pastTools: ToolDefinition[],
    findRelevantTools: (prompt: string, topK: number, threshold: number) => Promise<Array<{ id: string; similarity: number }>>,
    toolRegistry: { getMultiple: (ids: string[]) => ToolDefinition[] }
): Promise<void> {
    try {
        const tools = await findRelevantTools(prompt, config.search.defaultTopK, config.search.defaultSimilarityThreshold);
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