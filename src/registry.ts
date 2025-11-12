import { ToolDefinition } from './types';

/**
 * Registry for managing tool definitions.
 * Provides methods to register, retrieve, and manage tools used by the agent system.
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * Registers a new tool in the registry.
   * @param tool - The tool definition to register
   */
  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  /**
   * Retrieves a single tool by its ID.
   * @param toolId - The unique identifier of the tool
   * @returns The tool definition, or undefined if not found
   */
  get(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Retrieves multiple tools by their IDs.
   * @param toolIds - Array of tool identifiers
   * @returns Array of found tool definitions (skips not found tools)
   */
  getMultiple(toolIds: string[]): ToolDefinition[] {
    return toolIds
      .map((id) => this.get(id))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  }
}