import { ToolRegistry } from './registry';
import { ToolDefinition } from './types';
import { registerToolInDatabase } from './database';
import { demoTools } from './tools';

/**
 * Service class that manages tool registration across registry and database
 */
export class ToolService {
    private toolRegistry: ToolRegistry;

    constructor() {
        this.toolRegistry = new ToolRegistry();
    }

    /**
     * Registers a single tool in both registry and database
     * @param tool - The tool definition to register
     */
    async registerTool(tool: ToolDefinition): Promise<void> {
        this.toolRegistry.register(tool);
        await registerToolInDatabase(tool);
        console.log(`✓ Registered: ${tool.name}`);
    }

    /**
     * Sets up all demo tools by registering them in both the registry and database
     */
    async setupAllTools(): Promise<void> {
        for (const tool of demoTools) {
            await this.registerTool(tool);
        }
        console.log(`✓ All ${demoTools.length} tools registered successfully`);
    }

    /**
     * Gets the tool registry instance
     * @returns The tool registry
     */
    getRegistry(): ToolRegistry {
        return this.toolRegistry;
    }

    /**
     * Retrieves a single tool by ID
     * @param toolId - The tool identifier
     * @returns The tool definition or undefined
     */
    getTool(toolId: string): ToolDefinition | undefined {
        return this.toolRegistry.get(toolId);
    }

    /**
     * Retrieves multiple tools by their IDs
     * @param toolIds - Array of tool identifiers
     * @returns Array of found tool definitions
     */
    getMultipleTools(toolIds: string[]): ToolDefinition[] {
        return this.toolRegistry.getMultiple(toolIds);
    }
}