import express from 'express';
import http from 'http';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/mongo-connection.js';
import authRoutes from './routes/auth.route.js';
import journalRoutes from './routes/journal.route.js';
import aiInsightRoutes from './routes/aiinsight.route.js';
import journalTemplateRoutes from './routes/journalTemplate.route.js';
import goalTrackingRoutes from './routes/goalTracking.route.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up' });
});

const API_ROUTE_START = process.env.API_ROUTE_START || '/api/v1';

app.use(`${API_ROUTE_START}/auth`, authRoutes);
app.use(`${API_ROUTE_START}/journal`, journalRoutes);
app.use(`${API_ROUTE_START}/ai-insights`, aiInsightRoutes);
app.use(`${API_ROUTE_START}/journal-template`, journalTemplateRoutes);
app.use(`${API_ROUTE_START}/goal-tracking`, goalTrackingRoutes);

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});