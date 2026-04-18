// Setup DNS order to prefer IPv4 over IPv6 for faster resolutions in some environments
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Import core dependencies for the web server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import custom configurations and middleware
const { connectDB, disconnectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from the .env file
dotenv.config();

// Import passport for authentication strategies
const passport = require('passport');
require('./config/passport'); // Initializes Google OAuth strategy

// Import application route handlers
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const learnRoutes = require('./routes/learnRoutes');

// Initialize the Express application
const app = express();

// Trust reverse proxy (crucial for Render/Vercel OAuth HTTPS redirects)
app.set('trust proxy', 1);

// Establish connection to MongoDB via Prisma
connectDB();

// Determine allowed frontend origins for CORS (Cross-Origin Resource Sharing)
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001'];
console.log('Allowed Origins:', allowedOrigins);

// Configure CORS middleware to securely allow requests from the frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);

    // Check if the incoming request origin is whitelisted or if running in dev mode
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
}));

// Setup middleware to parse incoming request bodies (JSON and URL-encoded data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize passport authentication middleware on all routes
app.use(passport.initialize());

// Setup a default root endpoint to verify API availability
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      budgets: '/api/budgets',
      goals: '/api/goals',
      ai: '/api/ai'
    }
  });
});

// Register core application routes under the /api prefix
app.use('/api/auth', authRoutes); // Handles login, register, oauth, profile setup
app.use('/api/transactions', transactionRoutes); // Handles all income/expense records
app.use('/api/budgets', budgetRoutes); // Handles spending limits and limits tracking
app.use('/api/goals', goalRoutes); // Handles user financial goals
app.use('/api/ai', aiRoutes); // Handles Gemini AI assistant prompts
app.use('/api/learn', learnRoutes); // Handles cross-user global learning modules

// Simple health check endpoint used by uptime monitors (e.g. Vercel/Render)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// Catch-all error handling middleware to gracefully return errors instead of crashing
app.use(errorHandler);

// Define the port to run the server on (defaults to 5000)
const PORT = process.env.PORT || 5000;

// Start the HTTP server listening on all network interfaces
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown: Triggered by hosting providers like Render/Vercel during redeploys
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await disconnectDB(); // Safely disconnect from the database to prevent memory leaks
    process.exit(0);
  });
});

// Graceful shutdown: Triggered by user hitting Ctrl+C in the terminal
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await disconnectDB(); // Safely disconnect from the database
    process.exit(0);
  });
});

// Export the app instance for integration testing
module.exports = app;