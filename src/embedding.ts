import { EmbeddingModel, FlagEmbedding } from 'fastembed';

let embeddingModel: FlagEmbedding | null = null;

const MODEL_NAME = EmbeddingModel.BGESmallENV15;
const DIMENSIONS = 384;

/**
 * Initializes the FastEmbed embedding model.
 * Only initializes once - subsequent calls are no-ops.
 */
export async function initializeEmbeddingModel(): Promise<void> {
  if (!embeddingModel) {
    console.log('Initializing FastEmbed model...');
    try {
      embeddingModel = await FlagEmbedding.init({
        model: MODEL_NAME,
        maxLength: 512,
      });
      console.log(`✓ FastEmbed model initialized: ${MODEL_NAME} (${DIMENSIONS}D)`);
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      throw error;
    }
  }
}

/**
 * Generates a vector embedding for a single text input.
 * @param text - The text to generate an embedding for
 * @returns A numerical vector representation of the text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingModel) {
    await initializeEmbeddingModel();
  }

  if (!embeddingModel) {
    throw new Error('Embedding model not initialized');
  }

  try {
    const generator = embeddingModel.embed([text]);
    const result = await generator.next();

    if (result.done || !result.value) {
      throw new Error('Failed to generate embedding');
    }

    const batch = result.value;
    if (!batch || batch.length === 0) {
      throw new Error('Empty batch returned from embedding model');
    }

    return Array.from(batch[0]);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generates vector embeddings for multiple text inputs in batch.
 * More efficient than calling generateEmbedding multiple times.
 * @param texts - Array of texts to generate embeddings for
 * @returns Array of numerical vector representations
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!embeddingModel) {
    await initializeEmbeddingModel();
  }

  if (!embeddingModel) {
    throw new Error('Embedding model not initialized');
  }

  try {
    const embeddings: number[][] = [];
    const generator = embeddingModel.embed(texts);

    for await (const batch of generator) {
      for (const embedding of batch) {
        embeddings.push(Array.from(embedding));
      }
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}

/**
 * Creates a searchable text string from tool metadata.
 * @param name - Tool name
 * @param description - Tool description
 * @param keywords - Tool keywords
 * @returns Formatted search text
 */
export function createToolSearchText(
  name: string,
  description: string,
  keywords: string[]
): string {
  const keywordText = keywords.join(', ');
  return `${name}. ${description}. Keywords: ${keywordText}`;
}

/**
 * Returns information about the embedding model configuration.
 * @returns Model configuration details
 */
export function getModelInfo() {
  return {
    model: MODEL_NAME,
    dimensions: DIMENSIONS,
    maxLength: 512,
  };
}

/**
 * Closes and cleans up the embedding model.
 */
export async function closeEmbeddingModel(): Promise<void> {
  if (embeddingModel) {
    embeddingModel = null;
    console.log('✓ Embedding model closed');
  }
}
