import readline from 'readline';
import { initializeEmbeddingModel } from './embedding';
import { initDatabase, findRelevantTools } from './database';
import { handlePrompt } from './agent';
import { ToolService } from './toolService';
import { ToolDefinition } from './types';

const toolService = new ToolService();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Main application entry point.
 * Initializes the system and starts the interactive prompt loop.
 */
async function main(): Promise<void> {
    try {
        console.log('🚀 Starting Dynamic Tool Selection System...');
        
        // Initialize core systems
        await initializeEmbeddingModel();
        await initDatabase();
        await toolService.setupAllTools();
        
        console.log('✓ All systems initialized and ready!');
        console.log('Type your queries or "exit" to quit.\n');

        const userID = 'user1';
        const pastTools: ToolDefinition[] = [];

        // Interactive prompt loop
        while (true) {
            const text: string = await new Promise((resolve) =>
                rl.question('> ', resolve)
            );
            
            if (text.trim().toLowerCase() === 'exit') {
                console.log('👋 Goodbye!');
                break;
            }
            
            if (text.trim()) {
                await handlePrompt(
                    userID, 
                    text, 
                    pastTools, 
                    findRelevantTools, 
                    toolService.getRegistry()
                );
            }
        }
    } catch (error) {
        console.error('❌ Application error:', error);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Start the application
main().catch((error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
});