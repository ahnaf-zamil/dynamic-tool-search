import { z } from 'zod';

/**
 * Defines the structure of a tool that can be registered and used by the agent system.
 */
export interface ToolDefinition {
  /** Unique identifier for the tool */
  id: string;

  /** Human-readable name of the tool */
  name: string;

  /** Detailed description of what the tool does */
  description: string;

  /** Array of keywords for semantic search and tool discovery */
  keywords: string[];

  /** Zod schema defining the tool's input parameters */
  parameters: z.ZodObject<any>;

  /** Function that executes the tool's logic */
  execute: (params: any) => Promise<any>;
}