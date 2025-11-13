import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration interface
 */
export interface AppConfig {
    database: {
        url: string;
        maxConnections: number;
        idleTimeoutMs: number;
        connectionTimeoutMs: number;
    };
    embedding: {
        model: string;
        dimensions: number;
        maxLength: number;
    };
    agent: {
        model: string;
        name: string;
        instructions: string;
    };
    search: {
        defaultTopK: number;
        defaultSimilarityThreshold: number;
    };
}

/**
 * Validates that required environment variables are set
 * @throws Error if required environment variables are missing
 */
function validateEnvironment(): void {
    const requiredVars = ['DATABASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}. ` +
            'Please check your .env file or environment configuration.'
        );
    }
}

/**
 * Creates and validates application configuration
 * @returns Validated application configuration
 */
export function createConfig(): AppConfig {
    validateEnvironment();

    return {
        database: {
            url: process.env.DATABASE_URL!,
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
            idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
            connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
        },
        embedding: {
            model: process.env.EMBEDDING_MODEL || 'BGESmallENV15',
            dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '384', 10),
            maxLength: parseInt(process.env.EMBEDDING_MAX_LENGTH || '512', 10),
        },
        agent: {
            model: process.env.AGENT_MODEL || 'google/gemini-2.0-flash',
            name: process.env.AGENT_NAME || 'Dynamic Agent',
            instructions: process.env.AGENT_INSTRUCTIONS || `You are a helpful assistant with access to specific tools.
        Use the best tools depending on prompt.
        You have the ability to remember chat history, past conversations and internal states.
        Make sure you are able to remember and differentiate between what you said and what the user said, do not confuse the two.`,
        },
        search: {
            defaultTopK: parseInt(process.env.SEARCH_TOP_K || '3', 10),
            defaultSimilarityThreshold: parseFloat(process.env.SEARCH_SIMILARITY_THRESHOLD || '0.6'),
        },
    };
}

/**
 * Global configuration instance
 */
export const config = createConfig();