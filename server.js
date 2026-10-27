require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// MCP imports
const { createMcpExpressApp } = require('@modelcontextprotocol/express');
const { toNodeHandler } = require('@modelcontextprotocol/node');
const { createMcpHandler, McpServer } = require('@modelcontextprotocol/server');
const { searchMentors, searchMentorsSchema } = require('./mcp-tools');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Generative AI with API key from environment variables
let genAI = null;
let model = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Initialize model once at server startup to avoid per-request overhead
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    console.log('Gemini model initialized: gemini-flash-latest');
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error.message);
}

// Security middleware
app.use(cors({
  origin: '*', // In production, specify your actual domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' })); // Limit request size to prevent abuse

// Serve static files from parent directory (your existing website)
app.use(express.static('../'));

// MCP Server Setup
// Create MCP handler with search_mentors tool
const mcpHandler = createMcpHandler(() => {
  const server = new McpServer({
    name: 'help-her-mentors',
    version: '1.0.0'
  });

  // Register search_mentors tool
  server.registerTool(
    'search_mentors',
    {
      description: 'Search for women mentors in technology by field, language, and experience level. Returns only mentors who have opted in to be discoverable.',
      inputSchema: searchMentorsSchema
    },
    async (args) => {
      const results = searchMentors(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      };
    }
  );

  return server;
});

// Create Node handler for MCP
const mcpNodeHandler = toNodeHandler(mcpHandler);

// Mount MCP handler at /mcp route on the main Express app
app.all('/mcp', (req, res) => void mcpNodeHandler(req, res, req.body));

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Remove requests older than the time window
  const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return true;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mentor search wrapper endpoint (calls MCP tool internally)
// Supports both POST (body) and GET (query parameters)
app.all('/api/mentors/search', (req, res) => {
  try {
    // Get parameters from body (POST) or query string (GET)
    const technologyField = req.body.technologyField || req.query.technologyField || req.query.technology;
    const language = req.body.language || req.query.language;
    const experienceLevel = req.body.experienceLevel || req.query.experienceLevel || req.query.experience;
    
    // Call the search_mentors function directly (same logic as MCP tool)
    const results = searchMentors({ technologyField, language, experienceLevel });
    
    res.json({
      success: true,
      count: results.length,
      mentors: results
    });
  } catch (error) {
    console.error('Error in /api/mentors/search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search mentors. Please try again.'
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Get client IP for rate limiting
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.'
      });
    }

    // Validate request body
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. Message is required and must be a string.'
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message is too long. Maximum 1000 characters allowed.'
      });
    }

    // Check if API key and model are configured
    if (!process.env.GEMINI_API_KEY || !genAI || !model) {
      console.error('GEMINI_API_KEY or model is not configured in environment variables');
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.'
      });
    }

    console.log(`Processing message from ${clientIp}: "${message.substring(0, 50)}..."`);

    // Start overall timing
    const overallStartTime = Date.now();

    // Shortened system prompt for faster processing
    const systemPrompt = "You are a friendly AI assistant for HELP HER, helping women and girls learn technology. Provide clear, simple explanations in under 100 words. Be encouraging and avoid jargon.";

    // Start API timing
    const apiStartTime = Date.now();
    console.log('Starting Gemini API call...');

    // Call Gemini API with timeout (reduced from 30s to 15s for better UX)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
    });

    // Retry logic for temporary failures
    let aiResponse = null;
    let lastError = null;
    const maxRetries = 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`Retry attempt ${attempt}/${maxRetries}...`);
            }

            // Measure pure Gemini API call separately
            const geminiStartTime = Date.now();
            const geminiCall = model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
                generationConfig: {
                    maxOutputTokens: 500,  // Allow complete responses
                    temperature: 0.7,
                }
            });

            const result = await Promise.race([geminiCall, timeoutPromise]);
            const geminiEndTime = Date.now();
            const pureGeminiTime = geminiEndTime - geminiStartTime;
            console.log(`PURE Gemini API call duration: ${pureGeminiTime}ms`);

            const apiEndTime = Date.now();
            const apiTime = apiEndTime - apiStartTime;
            console.log(`Total Promise.race duration: ${apiTime}ms`);

            aiResponse = result.response.text();
            console.log(`Response length: ${aiResponse.length} characters`);
            break; // Success, exit retry loop
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed:`, error.message);
            if (attempt < maxRetries) {
                // Wait briefly before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    if (!aiResponse) {
        throw lastError;
    }

    // Calculate timing
    const overallEndTime = Date.now();
    const overallTime = overallEndTime - overallStartTime;
    const serverProcessingTime = overallTime - apiTime;
    
    console.log('='.repeat(50));
    console.log('SERVER TIMING BREAKDOWN:');
    console.log('='.repeat(50));
    console.log(`Total server time: ${overallTime}ms`);
    console.log(`  - Gemini API call: ${apiTime}ms`);
    console.log(`  - Server processing: ${serverProcessingTime}ms`);
    console.log('='.repeat(50));
    console.log(`AI response sent to ${clientIp}`);

    // Send response to frontend
    res.json({
      reply: aiResponse,
      model: "gemini-flash-latest",
      responseTime: overallTime
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    console.error('Error status:', error.status);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Check for timeout specifically
    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'The request took too long to respond. Please try again with a shorter message or check your internet connection.'
      });
    }

    // Handle specific Gemini API errors based on status code
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Authentication error. Please check API key configuration.'
      });
    }

    if (error.status === 403) {
      return res.status(403).json({
        error: 'Access forbidden. Check your API permissions.'
      });
    }

    if (error.status === 404) {
      return res.status(500).json({
        error: 'Model not found. Please check the model name.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later.'
      });
    }

    if (error.status === 500 || error.status === 503) {
      return res.status(503).json({
        error: 'Google AI service temporarily unavailable. Please try again later.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to process your request. Please try again.'
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('HELP HER Backend Server');
  console.log('='.repeat(50));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Gemini API Key configured: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
  console.log(`Gemini model initialized: ${model ? 'YES' : 'NO'}`);
  console.log(`MCP endpoint available at: http://localhost:${PORT}/mcp`);
  console.log(`Mentor search API at: http://localhost:${PORT}/api/mentors/search`);
  console.log('='.repeat(50));
  console.log('Press Ctrl+C to stop the server');
  console.log('='.repeat(50));
});
