import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';
import { fastembed } from '@mastra/fastembed';

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
      connectionString: process.env.DATABASE_URL!,
    }),
    storage: new PostgresStore({
      connectionString: process.env.DATABASE_URL!,
    }),
  });

  return sharedMemory;
}
