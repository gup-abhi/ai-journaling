import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const FRONTEND_URL = isProduction ? process.env.BACKEND_URL : process.env.FRONTEND_URL;
export const BACKEND_URL = process.env.BACKEND_URL;
