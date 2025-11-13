import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';
import { fastembed } from '@mastra/fastembed';
import { config } from './config';

let sharedMemory: Memory | null = null;

/**
 * Retrieves or creates a singleton instance of the shared memory system.
 * Configures memory with working memory, semantic recall, and thread management.
 * @returns The shared Memory instance
 */
export async function getSharedMemory(): Promise<Memory> {
  if (sharedMemory) {
    return sharedMemory;
  }

  sharedMemory = new Memory({
    options: {
      workingMemory: { enabled: true, scope: 'resource' },
      lastMessages: 5,
      semanticRecall: { scope: 'resource', topK: 3, messageRange: 2 },
      threads: { generateTitle: true },
    },
    embedder: fastembed,
    vector: new PgVector({
      connectionString: config.database.url,
    }),
    storage: new PostgresStore({
      connectionString: config.database.url,
    }),
  });

  return sharedMemory;
}
