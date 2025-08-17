import express from 'express';
import http from 'http';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './lib/mongo-connection.js';
import authRoutes from './routes/auth.route.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5001'
}));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up' });
});

app.use('/api/auth', authRoutes);

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});