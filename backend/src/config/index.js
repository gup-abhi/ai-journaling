import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const FRONTEND_URL = isProduction ? process.env.BACKEND_URL : 'http://localhost:5173';
export const BACKEND_URL = isProduction ? process.env.BACKEND_URL : `http://localhost:${process.env.PORT}`;
