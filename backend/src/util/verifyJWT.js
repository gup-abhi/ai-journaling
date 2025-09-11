import { jwtVerify, createRemoteJWKSet } from 'jose';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
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

// Create JWKS client with jwks-rsa (more compatible with Supabase)
const jwksRsaClient = jwksClient({
  jwksUri: JWKS_URL,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Fallback using jose library
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyProjectJWT(token) {
  try {
    // First try with jwks-rsa (more compatible with Supabase)
    try {
      console.log('Attempting JWT verification with jwks-rsa...');
      const decoded = await verifyWithJwksRsa(token);
      console.log('JWT verification successful with jwks-rsa');
      return decoded;
    } catch (jwksRsaError) {
      console.warn('jwks-rsa verification failed, trying jose library:', jwksRsaError.message);

      // Fallback to jose library
      const data = await jwtVerify(token, JWKS, {
        issuer: ISSUER_URL,
        // Allow all algorithms that jose supports
      });
      console.log('JWT verification successful with jose library');
      return data;
    }
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

async function verifyWithJwksRsa(token) {
  return new Promise((resolve, reject) => {
    // Decode token header to get kid
    const decoded = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    console.log('JWT header:', { alg: decoded.alg, kid: decoded.kid });

    // Get the signing key
    jwksRsaClient.getSigningKey(decoded.kid, (err, key) => {
      if (err) {
        console.error('Failed to get signing key:', err);
        return reject(err);
      }

      const signingKey = key.getPublicKey();
      console.log('Retrieved signing key, algorithm:', key.alg || 'unknown');

      // Verify the token
      jwt.verify(token, signingKey, {
        issuer: ISSUER_URL,
        algorithms: ['RS256', 'ES256', 'PS256'] // Common Supabase algorithms
      }, (verifyErr, decoded) => {
        if (verifyErr) {
          console.error('Token verification failed:', verifyErr);
          return reject(verifyErr);
        }

        resolve({ payload: decoded });
      });
    });
  });
}

