# Dynamic Tool Selection System

A dynamic tool selection system that uses vector embeddings to intelligently select and provide tools to an AI agent based on user queries.

## Overview

This project implements a conversational AI agent with dynamic tool selection capabilities. It uses semantic search over tool embeddings to automatically identify and provide relevant tools to the agent based on the user's input, creating a more efficient and context-aware assistant.

### Key Features

- **Vector-based Tool Discovery**: Uses FastEmbed to generate embeddings for tools and user queries
- **PostgreSQL with pgvector**: Stores and searches tool embeddings using cosine similarity
- **Dynamic Agent Configuration**: Automatically equips the agent with relevant tools for each conversation
- **Persistent Memory**: Remembers conversation history and context using Mastra's memory system
- **30+ Pre-built Tools**: Includes tools for weather, communication, calendar, tasks, data analytics, files, payments, social media, translation, web scraping, image processing, and more

## Architecture

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Generate Query Embedding   │
│     (FastEmbed Model)       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Vector Similarity Search   │
│    (PostgreSQL + pgvector)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Retrieve Relevant Tools    │
│    (Top K by similarity)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Create Dynamic Agent       │
│  (with selected tools)      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Generate Response         │
│   (Gemini 2.0 Flash)        │
└─────────────────────────────┘
```

## Prerequisites

- **Node.js**: >= 20.9.0
- **PostgreSQL**: With pgvector extension support
- **Database**: A PostgreSQL database with vector support

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```

4. **Set up PostgreSQL with pgvector**

   Install the pgvector extension in your PostgreSQL database:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   The application will automatically create the required tables on first run.

## Usage

### Development Mode

Start the application in development mode with auto-reload:

```bash
npm run dev
```

### Production Mode

Build and start the application:

```bash
npm run build
npm start
```

### Running the Application

Once started, you'll see an interactive prompt:

```
>
```

Type your queries naturally, and the system will:
1. Find relevant tools using semantic search
2. Provide those tools to the AI agent
3. Generate a response using the available tools

**Example queries:**
- "What's the weather in San Francisco?"
- "Send an email to john@example.com about the meeting"
- "Create a task to review the code"
- "Translate 'hello' from English to Spanish"

Type `exit` to quit the application.

## Project Structure

```
dynamic-tool-selector/
├── src/
│   ├── main.ts          # Main application entry point and orchestration
│   ├── embedding.ts     # FastEmbed model initialization and embedding generation
│   ├── memory.ts        # Shared memory configuration for agent persistence
│   ├── registry.ts      # Tool registry for managing tool definitions
│   ├── tools.ts         # Collection of 30+ pre-built demo tools
│   └── types.ts         # TypeScript type definitions
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── .env                 # Environment variables (create this)
```

## How It Works

### 1. Tool Registration

At startup, all tools are registered with:
- Unique ID
- Name and description
- Keywords for semantic matching
- Parameter schemas (using Zod)
- Execute function

Each tool's metadata is embedded using FastEmbed (BGE-Small-EN-v1.5) and stored in PostgreSQL.

### 2. Query Processing

When a user submits a query:
1. The query is embedded using the same model
2. Vector similarity search finds the top K most relevant tools
3. Tools accumulate over the conversation (maintains context)
4. A dynamic agent is created with these tools

### 3. Response Generation

The agent:
- Receives the user prompt
- Has access to conversation history via memory
- Can use any of the provided tools
- Generates a response using Gemini 2.0 Flash

## Configuration

### Embedding Model

The system uses `BGESmallENV15` (384 dimensions) from FastEmbed. You can change this in [embedding.ts:5](src/embedding.ts#L5):

```typescript
const MODEL_NAME = EmbeddingModel.BGESmallENV15;
const DIMENSIONS = 384;
```

### Tool Selection Parameters

Adjust tool selection in [main.ts:201](src/main.ts#L201):

```typescript
const tools = await findRelevantTools(prompt, 3, 0.6);
//                                            ↑   ↑
//                                         topK  similarity threshold
```

### AI Model

The default model is Gemini 2.0 Flash. Change it in [main.ts:181](src/main.ts#L181):

```typescript
model: 'google/gemini-2.0-flash',
```

## Database Schema

### `tool_embeddings` Table

| Column          | Type          | Description                          |
|-----------------|---------------|--------------------------------------|
| id              | SERIAL        | Primary key                          |
| tool_id         | VARCHAR(255)  | Unique tool identifier               |
| tool_name       | VARCHAR(255)  | Human-readable tool name             |
| description     | TEXT          | Tool description                     |
| keywords        | TEXT[]        | Array of search keywords             |
| parameters      | JSONB         | Tool parameter schema                |
| tool_definition | JSONB         | Complete tool definition             |
| embedding       | vector(384)   | Tool embedding vector                |
| created_at      | TIMESTAMP     | Creation timestamp                   |

### Indexes

- `tool_embeddings_vector_idx`: IVFFlat index on embedding for fast similarity search

## Available Tools

The system includes 30+ tools across multiple categories:

- **Weather & Environment**: Get weather, air quality
- **Communication**: Send email, SMS, Slack messages
- **Calendar & Scheduling**: Create events, check availability
- **Task Management**: Create, update, list tasks
- **Data & Analytics**: Query database, generate reports
- **File Management**: Upload, search files
- **E-commerce & Payments**: Process payments, track orders
- **Social Media**: Post to Twitter, get analytics
- **Translation & Language**: Translate text
- **Web Scraping & APIs**: Fetch webpages, call external APIs
- **Image Processing**: Generate and analyze images
- **Notifications**: Send push notifications
- **Code & Development**: Run code, generate code snippets

See [tools.ts](src/tools.ts) for the complete list.

## Adding Custom Tools

To add a new tool, add it to the `demoTools` array in [tools.ts](src/tools.ts):

```typescript
{
  id: 'my_custom_tool',
  name: 'My Custom Tool',
  description: 'What this tool does',
  keywords: ['relevant', 'search', 'keywords'],
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
  }),
  execute: async (params) => {
    // Your tool logic here
    return { result: 'success' };
  },
}
```

## Technologies Used

- **[@mastra/core](https://www.npmjs.com/package/@mastra/core)**: Agent framework
- **[@mastra/memory](https://www.npmjs.com/package/@mastra/memory)**: Conversation memory
- **[@mastra/fastembed](https://www.npmjs.com/package/@mastra/fastembed)**: Embedding generation
- **[@mastra/pg](https://www.npmjs.com/package/@mastra/pg)**: PostgreSQL integration
- **[fastembed](https://www.npmjs.com/package/fastembed)**: Fast embedding models
- **[pg](https://www.npmjs.com/package/pg)**: PostgreSQL client
- **[zod](https://www.npmjs.com/package/zod)**: Schema validation
- **TypeScript**: Type safety and better developer experience

## Troubleshooting

### Database Connection Issues

Ensure your `DATABASE_URL` is correct and PostgreSQL is running:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

### pgvector Extension Missing

Install pgvector in your PostgreSQL instance:
```bash
# On Ubuntu/Debian
sudo apt-get install postgresql-15-pgvector

# Or build from source
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

### Embedding Model Download

On first run, FastEmbed will download the model (~100MB). Ensure you have:
- Sufficient disk space
- Internet connectivity
- Write permissions in the cache directory

## Performance Considerations

- **Connection Pool**: Configured for max 20 connections
- **Embedding Cache**: Models are cached in memory after initialization
- **Vector Index**: IVFFlat index provides fast approximate nearest neighbor search
- **Tool Accumulation**: Tools accumulate per user session for context continuity

## License

ISC

