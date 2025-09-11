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

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Refresh"], 
    credentials: true,
    // ADD THIS LINE - expose headers for mobile token refresh
    exposedHeaders: "*"
}));

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


// curl -X GET "https://ai-journaling.onrender.com/api/v1/auth/user" \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6Im1vYW9udk4rZisrWmxOdDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NjbGZ0amRkaG1jbnJ0bmJka2tnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxNzFlZTFhYi1kMGIyLTQ4YmUtODk3MS01Mzc2ZGU4M2QzMTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3MzAwMTk1LCJpYXQiOjE3NTcyOTY1OTUsImVtYWlsIjoiYWd1cHRhLmVuZ2luZWVyLmVtYWlsQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0ozaXNpdFVXSkgxa3NLX0xZeHh2eEFtbmZhS1B3U19HdldOblZFcHRDMWFxYmgwc3M9czk2LWMiLCJkaXNwbGF5X25hbWUiOiJBYmhpc2hlayBHdXB0YSIsImVtYWlsIjoiYWd1cHRhLmVuZ2luZWVyLmVtYWlsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJBYmhpc2hlayBHdXB0dGEiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQWJoaXNoZWsgR3VwdHRhIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSjNpc2l0VVdKSDFrc0tfTFl4eHZ4QW1uZmFLUHdTX0d2V05uVkVwdEMxYXFiaDBzcz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA3MjYxNjk1NzM5Mzc1NzM2OTY3Iiwic3ViIjoiMTA3MjYxNjk1NzM5Mzc1NzM2OTY3In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE3NTcyOTY1OTV9XSwic2Vzc2lvbl9pZCI6IjI3YTNhMThjLTNhY2MtNDMwMy04ZjRkLTBkMTU0MGNmYjNlNyIsImlzX2Fub255bW91cyI6ZmFsc2V9.JdKBOZWiKLptdwEEfm64vCctBCduvc5EBhQwREU1EDY" \
//   -H "Refresh: Bearer pxnb62ta4e7q" \
//   -H "Content-Type: application/json"