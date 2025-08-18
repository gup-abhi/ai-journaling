import express from 'express';
import http from 'http';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/mongo-connection.js';
import authRoutes from './routes/auth.route.js';
import journalRoutes from './routes/journal.route.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5001'
}));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/journal', journalRoutes);

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});