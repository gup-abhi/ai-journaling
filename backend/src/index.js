import express from 'express';
import http from 'http';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/mongo-connection.js';
import authRoutes from './routes/auth.route.js';
import journalRoutes from './routes/journal.route.js';
import aiInsightRoutes from './routes/insight.route.js';
import journalTemplateRoutes from './routes/journalTemplate.route.js';
import goalTrackingRoutes from './routes/goalTracking.route.js';
import streakRoutes from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middlewares/error-handler.js'; // Import the error handler
import logger from './lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Refresh']
};


app.use(cors(corsOptions));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up' });
});

const API_ROUTE_START = process.env.API_ROUTE_START || '/api/v1';

app.use(`${API_ROUTE_START}/auth`, authRoutes);
app.use(`${API_ROUTE_START}/journal`, journalRoutes);
app.use(`${API_ROUTE_START}/ai-insights`, aiInsightRoutes);
app.use(`${API_ROUTE_START}/journal-template`, journalTemplateRoutes);
app.use(`${API_ROUTE_START}/user`, streakRoutes);
app.use(`${API_ROUTE_START}/goal-tracking`, goalTrackingRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*_id', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handling middleware - MUST be last
app.use(errorHandler);

const server = http.createServer(app);

server.listen(process.env.PORT, async () => {
  await connectDB();
  logger.info(`Server is running on port ${process.env.PORT}`);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down... ${err.name} ${err.message} ${err.stack}`);
  server.close(() => {
    process.exit(1); // Exit with failure code
  });
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION! 💥 Shutting down... ${err.name} ${err.message} ${err.stack}`);
  server.close(() => {
    process.exit(1); // Exit with failure code
  });
});

export default server;