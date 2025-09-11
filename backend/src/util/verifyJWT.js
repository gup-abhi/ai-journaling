import { jwtVerify, createRemoteJWKSet } from 'jose';
import 'dotenv/config';

// URL of your JWKS endpoint
const JWKS_URL = process.env.SUPABASE_PROJECT_JWKS;
const ISSUER_URL = process.env.SUPABASE_ISSUER_URL;

if (!JWKS_URL) {
  throw new Error('SUPABASE_PROJECT_JWKS environment variable is required');
}

if (!ISSUER_URL) {
  throw new Error('SUPABASE_ISSUER_URL environment variable is required');
}

// Fallback using jose library
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyProjectJWT(token) {
  try {
      const data = await jwtVerify(token, JWKS, {
        issuer: ISSUER_URL,
        // Allow all algorithms that jose supports
      });
      console.log('JWT verification successful with jose library');
      return data;
  } catch (err) {
    console.error('JWT verification failed with both libraries:', err.message);
    console.error('Error details:', {
      name: err.name,
      code: err.code,
      message: err.message
    });
    throw err;
  }
}
