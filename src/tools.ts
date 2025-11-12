import { z } from 'zod';
import { ToolDefinition } from './types';

/**
 * Collection of demo tools for the dynamic tool selection system.
 * Each tool includes metadata for semantic search and an execute function.
 */
export const demoTools: ToolDefinition[] = [
  // ========== Weather & Environment ==========
  {
    id: 'get_weather',
    name: 'Get Weather',
    description: 'Retrieves current weather information for a given location including temperature, conditions, and forecast',
    keywords: ['weather', 'temperature', 'forecast', 'climate', 'rain', 'sunny', 'cloudy', 'conditions'],
    parameters: z.object({
      location: z.string().describe('City name or coordinates'),
      units: z.enum(['celsius', 'fahrenheit']).optional().default('fahrenheit'),
    }),
    execute: async (params) => {
      return {
        location: params.location,
        temperature: Math.floor(Math.random() * 40) + 50,
        condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
      };
    },
  },
  
  {
    id: 'get_air_quality',
    name: 'Get Air Quality',
    description: 'Retrieves air quality index (AQI) and pollution levels for a specified location',
    keywords: ['air quality', 'pollution', 'aqi', 'environment', 'smog', 'health', 'outdoor'],
    parameters: z.object({
      location: z.string().describe('City name or coordinates'),
    }),
    execute: async (params) => {
      return {
        location: params.location,
        aqi: Math.floor(Math.random() * 150) + 1,
        category: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups'][Math.floor(Math.random() * 3)],
        pollutants: {
          pm25: Math.random() * 50,
          pm10: Math.random() * 100,
          ozone: Math.random() * 80,
        },
      };
    },
  },

  // ========== Communication ==========
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Sends an email to specified recipients with subject and body content',
    keywords: ['email', 'send', 'mail', 'message', 'communicate', 'notify', 'inbox', 'correspondence'],
    parameters: z.object({
      to: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      body: z.string().describe('Email body content'),
      cc: z.string().optional().describe('CC email addresses'),
    }),
    execute: async (params) => {
      return {
        status: 'sent',
        messageId: `msg_${Date.now()}`,
        to: params.to,
        subject: params.subject,
        sentAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'send_sms',
    name: 'Send SMS',
    description: 'Sends a text message (SMS) to a phone number',
    keywords: ['sms', 'text', 'message', 'phone', 'mobile', 'cell', 'notify', 'alert'],
    parameters: z.object({
      phoneNumber: z.string().describe('Recipient phone number'),
      message: z.string().describe('SMS message content'),
    }),
    execute: async (params) => {
      return {
        status: 'sent',
        messageId: `sms_${Date.now()}`,
        phoneNumber: params.phoneNumber,
        sentAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'send_slack_message',
    name: 'Send Slack Message',
    description: 'Sends a message to a Slack channel or user',
    keywords: ['slack', 'message', 'chat', 'team', 'collaborate', 'workspace', 'channel', 'dm'],
    parameters: z.object({
      channel: z.string().describe('Slack channel name or user ID'),
      message: z.string().describe('Message content'),
      threadId: z.string().optional().describe('Thread ID to reply to'),
    }),
    execute: async (params) => {
      return {
        status: 'sent',
        channel: params.channel,
        timestamp: Date.now().toString(),
        messageId: `slack_${Date.now()}`,
      };
    },
  },

  // ========== Calendar & Scheduling ==========
  {
    id: 'create_calendar_event',
    name: 'Create Calendar Event',
    description: 'Creates a new calendar event with title, time, and attendees',
    keywords: ['calendar', 'event', 'meeting', 'schedule', 'appointment', 'booking', 'date', 'time'],
    parameters: z.object({
      title: z.string().describe('Event title'),
      startTime: z.string().describe('Start time (ISO format)'),
      endTime: z.string().describe('End time (ISO format)'),
      attendees: z.array(z.string()).optional().describe('List of attendee emails'),
      description: z.string().optional().describe('Event description'),
    }),
    execute: async (params) => {
      return {
        eventId: `evt_${Date.now()}`,
        title: params.title,
        startTime: params.startTime,
        endTime: params.endTime,
        status: 'created',
        attendees: params.attendees || [],
      };
    },
  },

  {
    id: 'get_calendar_availability',
    name: 'Get Calendar Availability',
    description: 'Checks calendar availability for a given time range to find free slots',
    keywords: ['calendar', 'availability', 'free', 'busy', 'schedule', 'time slots', 'booking'],
    parameters: z.object({
      startDate: z.string().describe('Start date (ISO format)'),
      endDate: z.string().describe('End date (ISO format)'),
      duration: z.number().optional().describe('Duration in minutes'),
    }),
    execute: async (_params) => {
      return {
        freeSlots: [
          { start: '2025-11-13T09:00:00Z', end: '2025-11-13T10:00:00Z' },
          { start: '2025-11-13T14:00:00Z', end: '2025-11-13T15:00:00Z' },
          { start: '2025-11-14T11:00:00Z', end: '2025-11-14T12:00:00Z' },
        ],
        busySlots: [
          { start: '2025-11-13T10:00:00Z', end: '2025-11-13T12:00:00Z' },
        ],
      };
    },
  },

  // ========== Task Management ==========
  {
    id: 'create_task',
    name: 'Create Task',
    description: 'Creates a new task or todo item with title, description, and due date',
    keywords: ['task', 'todo', 'create', 'item', 'work', 'assignment', 'checklist', 'project'],
    parameters: z.object({
      title: z.string().describe('Task title'),
      description: z.string().optional().describe('Task description'),
      dueDate: z.string().optional().describe('Due date (ISO format)'),
      priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
      assignee: z.string().optional().describe('Person assigned to the task'),
    }),
    execute: async (params) => {
      return {
        taskId: `task_${Date.now()}`,
        title: params.title,
        status: 'created',
        priority: params.priority,
        createdAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'update_task_status',
    name: 'Update Task Status',
    description: 'Updates the status of an existing task (e.g., in progress, completed, blocked)',
    keywords: ['task', 'update', 'status', 'complete', 'done', 'progress', 'todo', 'finish'],
    parameters: z.object({
      taskId: z.string().describe('Task identifier'),
      status: z.enum(['todo', 'in_progress', 'completed', 'blocked']).describe('New task status'),
      notes: z.string().optional().describe('Additional notes'),
    }),
    execute: async (params) => {
      return {
        taskId: params.taskId,
        status: params.status,
        updatedAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'list_tasks',
    name: 'List Tasks',
    description: 'Retrieves a list of tasks with optional filtering by status, assignee, or date',
    keywords: ['task', 'list', 'todo', 'show', 'view', 'get', 'fetch', 'retrieve', 'items'],
    parameters: z.object({
      status: z.enum(['todo', 'in_progress', 'completed', 'blocked']).optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    }),
    execute: async (_params) => {
      return {
        tasks: [
          { id: 'task_1', title: 'Review pull request', status: 'in_progress', priority: 'high' },
          { id: 'task_2', title: 'Update documentation', status: 'todo', priority: 'medium' },
          { id: 'task_3', title: 'Fix bug #123', status: 'completed', priority: 'high' },
        ],
        total: 3,
      };
    },
  },

  // ========== Data & Analytics ==========
  {
    id: 'query_database',
    name: 'Query Database',
    description: 'Executes a SQL query against the database and returns results',
    keywords: ['database', 'query', 'sql', 'data', 'fetch', 'retrieve', 'search', 'select'],
    parameters: z.object({
      query: z.string().describe('SQL query to execute'),
      limit: z.number().optional().default(100),
    }),
    execute: async (_params) => {
      return {
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ],
        rowCount: 2,
        executionTime: '45ms',
      };
    },
  },

  {
    id: 'generate_report',
    name: 'Generate Report',
    description: 'Generates an analytics report with charts and statistics for specified metrics',
    keywords: ['report', 'analytics', 'statistics', 'chart', 'graph', 'data', 'metrics', 'insights'],
    parameters: z.object({
      reportType: z.enum(['sales', 'traffic', 'user_engagement', 'performance']),
      startDate: z.string().describe('Start date (ISO format)'),
      endDate: z.string().describe('End date (ISO format)'),
      format: z.enum(['pdf', 'csv', 'json']).optional().default('json'),
    }),
    execute: async (params) => {
      return {
        reportId: `rpt_${Date.now()}`,
        reportType: params.reportType,
        dateRange: { start: params.startDate, end: params.endDate },
        summary: {
          totalRecords: 1523,
          avgValue: 234.56,
          trend: 'increasing',
        },
        generatedAt: new Date().toISOString(),
      };
    },
  },

  // ========== File Management ==========
  {
    id: 'upload_file',
    name: 'Upload File',
    description: 'Uploads a file to cloud storage with optional metadata and tags',
    keywords: ['file', 'upload', 'storage', 'document', 'save', 'cloud', 'attach'],
    parameters: z.object({
      fileName: z.string().describe('Name of the file'),
      fileContent: z.string().describe('File content (base64 encoded)'),
      folder: z.string().optional().describe('Destination folder'),
      tags: z.array(z.string()).optional().describe('File tags'),
    }),
    execute: async (params) => {
      return {
        fileId: `file_${Date.now()}`,
        fileName: params.fileName,
        url: `https://storage.example.com/${params.fileName}`,
        size: Math.floor(Math.random() * 10000000),
        uploadedAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'search_files',
    name: 'Search Files',
    description: 'Searches for files by name, content, or metadata tags',
    keywords: ['file', 'search', 'find', 'document', 'locate', 'query', 'lookup'],
    parameters: z.object({
      query: z.string().describe('Search query'),
      fileType: z.string().optional().describe('File type filter (e.g., pdf, docx)'),
      folder: z.string().optional().describe('Folder to search in'),
    }),
    execute: async (_params) => {
      return {
        results: [
          { id: 'file_1', name: 'report.pdf', path: '/documents/reports/', size: 2048576 },
          { id: 'file_2', name: 'presentation.pptx', path: '/documents/slides/', size: 5242880 },
        ],
        totalResults: 2,
      };
    },
  },

  // ========== E-commerce & Payments ==========
  {
    id: 'process_payment',
    name: 'Process Payment',
    description: 'Processes a payment transaction using credit card or other payment methods',
    keywords: ['payment', 'charge', 'transaction', 'pay', 'checkout', 'purchase', 'billing', 'invoice'],
    parameters: z.object({
      amount: z.number().describe('Payment amount'),
      currency: z.string().default('USD'),
      customerId: z.string().describe('Customer identifier'),
      description: z.string().optional().describe('Payment description'),
    }),
    execute: async (params) => {
      return {
        transactionId: `txn_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        status: 'success',
        processedAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'get_order_status',
    name: 'Get Order Status',
    description: 'Retrieves the current status and tracking information for an order',
    keywords: ['order', 'status', 'tracking', 'shipment', 'delivery', 'purchase', 'fulfillment'],
    parameters: z.object({
      orderId: z.string().describe('Order identifier'),
    }),
    execute: async (params) => {
      return {
        orderId: params.orderId,
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2025-11-15',
        items: [
          { id: 'item_1', name: 'Widget Pro', quantity: 2 },
        ],
      };
    },
  },

  // ========== Social Media ==========
  {
    id: 'post_to_twitter',
    name: 'Post to Twitter',
    description: 'Posts a tweet to Twitter/X with optional images and hashtags',
    keywords: ['twitter', 'tweet', 'post', 'social media', 'x', 'share', 'publish'],
    parameters: z.object({
      content: z.string().describe('Tweet content (max 280 chars)'),
      images: z.array(z.string()).optional().describe('Image URLs'),
      replyToId: z.string().optional().describe('Tweet ID to reply to'),
    }),
    execute: async (params) => {
      return {
        tweetId: `tweet_${Date.now()}`,
        content: params.content,
        postedAt: new Date().toISOString(),
        url: `https://twitter.com/user/status/${Date.now()}`,
      };
    },
  },

  {
    id: 'get_social_analytics',
    name: 'Get Social Analytics',
    description: 'Retrieves social media analytics including engagement, reach, and follower growth',
    keywords: ['social media', 'analytics', 'metrics', 'engagement', 'followers', 'likes', 'shares', 'insights'],
    parameters: z.object({
      platform: z.enum(['twitter', 'instagram', 'facebook', 'linkedin']),
      startDate: z.string().describe('Start date (ISO format)'),
      endDate: z.string().describe('End date (ISO format)'),
    }),
    execute: async (params) => {
      return {
        platform: params.platform,
        dateRange: { start: params.startDate, end: params.endDate },
        metrics: {
          totalPosts: 42,
          totalEngagement: 3456,
          newFollowers: 234,
          reach: 12345,
          impressions: 45678,
        },
      };
    },
  },

  // ========== Translation & Language ==========
  {
    id: 'translate_text',
    name: 'Translate Text',
    description: 'Translates text from one language to another',
    keywords: ['translate', 'translation', 'language', 'convert', 'localize', 'multilingual'],
    parameters: z.object({
      text: z.string().describe('Text to translate'),
      sourceLang: z.string().describe('Source language code (e.g., en, es, fr)'),
      targetLang: z.string().describe('Target language code'),
    }),
    execute: async (params) => {
      return {
        originalText: params.text,
        translatedText: `[Translated: ${params.text}]`,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        confidence: 0.95,
      };
    },
  },

  // ========== Web Scraping & APIs ==========
  {
    id: 'fetch_webpage',
    name: 'Fetch Webpage',
    description: 'Fetches and extracts content from a webpage URL',
    keywords: ['web', 'scrape', 'fetch', 'url', 'webpage', 'html', 'content', 'extract'],
    parameters: z.object({
      url: z.string().describe('Webpage URL'),
      selector: z.string().optional().describe('CSS selector to extract specific content'),
    }),
    execute: async (params) => {
      return {
        url: params.url,
        title: 'Example Page Title',
        content: 'This is the extracted page content...',
        fetchedAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'call_external_api',
    name: 'Call External API',
    description: 'Makes an HTTP request to an external API endpoint',
    keywords: ['api', 'http', 'request', 'rest', 'endpoint', 'call', 'fetch', 'external'],
    parameters: z.object({
      url: z.string().describe('API endpoint URL'),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
      headers: z.record(z.string(), z.string()).optional().describe('Request headers'),
      body: z.any().optional().describe('Request body'),
    }),
    execute: async (_params) => {
      return {
        statusCode: 200,
        response: { message: 'API call successful', data: {} },
        requestedAt: new Date().toISOString(),
      };
    },
  },

  // ========== Image Processing ==========
  {
    id: 'generate_image',
    name: 'Generate Image',
    description: 'Generates an AI image based on a text prompt using DALL-E or similar',
    keywords: ['image', 'generate', 'ai', 'create', 'dall-e', 'art', 'picture', 'visual'],
    parameters: z.object({
      prompt: z.string().describe('Text description of the image'),
      size: z.enum(['256x256', '512x512', '1024x1024']).optional().default('1024x1024'),
      style: z.string().optional().describe('Art style (e.g., realistic, cartoon, abstract)'),
    }),
    execute: async (params) => {
      return {
        imageId: `img_${Date.now()}`,
        url: `https://images.example.com/${Date.now()}.png`,
        prompt: params.prompt,
        size: params.size,
        generatedAt: new Date().toISOString(),
      };
    },
  },

  {
    id: 'analyze_image',
    name: 'Analyze Image',
    description: 'Analyzes an image to detect objects, faces, text, or other features',
    keywords: ['image', 'analyze', 'vision', 'detect', 'recognize', 'ocr', 'object detection'],
    parameters: z.object({
      imageUrl: z.string().describe('URL of the image to analyze'),
      features: z.array(z.enum(['objects', 'faces', 'text', 'colors'])).describe('Features to detect'),
    }),
    execute: async (params) => {
      return {
        imageUrl: params.imageUrl,
        detectedObjects: ['person', 'car', 'building'],
        faces: 2,
        text: 'Sample text found in image',
        dominantColors: ['#FF5733', '#3498DB'],
        analyzedAt: new Date().toISOString(),
      };
    },
  },

  // ========== Notifications ==========
  {
    id: 'send_push_notification',
    name: 'Send Push Notification',
    description: 'Sends a push notification to mobile devices or web browsers',
    keywords: ['push', 'notification', 'alert', 'mobile', 'app', 'notify', 'message'],
    parameters: z.object({
      userId: z.string().describe('User identifier'),
      title: z.string().describe('Notification title'),
      body: z.string().describe('Notification body'),
      data: z.record(z.string(), z.any()).optional().describe('Additional data payload'),
    }),
    execute: async (params) => {
      return {
        notificationId: `notif_${Date.now()}`,
        userId: params.userId,
        status: 'sent',
        sentAt: new Date().toISOString(),
      };
    },
  },

  // ========== Code & Development ==========
  {
    id: 'run_code',
    name: 'Run Code',
    description: 'Executes code in a sandboxed environment and returns the output',
    keywords: ['code', 'execute', 'run', 'programming', 'script', 'compile', 'sandbox'],
    parameters: z.object({
      language: z.enum(['python', 'javascript', 'typescript', 'ruby']),
      code: z.string().describe('Code to execute'),
      timeout: z.number().optional().default(30).describe('Execution timeout in seconds'),
    }),
    execute: async (params) => {
      return {
        executionId: `exec_${Date.now()}`,
        language: params.language,
        output: 'Hello, World!\n',
        error: null,
        executionTime: '125ms',
      };
    },
  },

  {
    id: 'generate_code',
    name: 'Generate Code',
    description: 'Generates code snippets based on natural language description',
    keywords: ['code', 'generate', 'programming', 'ai', 'copilot', 'create', 'write', 'function'],
    parameters: z.object({
      description: z.string().describe('What the code should do'),
      language: z.enum(['python', 'javascript', 'typescript', 'java', 'go']),
      style: z.string().optional().describe('Code style preferences'),
    }),
    execute: async (params) => {
      return {
        code: `function example() {\n  // Generated code based on: ${params.description}\n  console.log('Hello');\n}`,
        language: params.language,
        explanation: 'This function demonstrates the requested functionality.',
        generatedAt: new Date().toISOString(),
      };
    },
  },
];