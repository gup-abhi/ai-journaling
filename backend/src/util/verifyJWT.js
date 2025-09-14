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
      // Add more detailed logging for debugging
      console.log('=== JWT Verification Debug ===');
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      console.log('JWKS URL:', JWKS_URL);
      console.log('Issuer URL:', ISSUER_URL);
      console.log('Current time:', new Date().toISOString());
      
      // Decode JWT payload without verification to check expiration
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            console.log('JWT payload (decoded):', payload);
            
            if (payload.exp) {
              const expDate = new Date(payload.exp * 1000);
              const now = new Date();
              const timeDiff = expDate.getTime() - now.getTime();
              
              console.log('Token expiration:', expDate.toISOString());
              console.log('Current time:', now.toISOString());
              console.log('Time until expiration (ms):', timeDiff);
              console.log('Token expired:', timeDiff < 0);
              
              if (timeDiff < 0) {
                console.warn('⚠️  Token is already expired!');
              }
            }
          }
        } catch (decodeErr) {
          console.warn('Could not decode JWT payload:', decodeErr.message);
        }
      }

      const data = await jwtVerify(token, JWKS, {
        issuer: ISSUER_URL,
        // Add clock tolerance to handle minor time differences
        clockTolerance: 30, // 30 seconds tolerance
      });
      console.log('✅ JWT verification successful with jose library');
      return data;
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    console.error('Error details:', {
      name: err.name,
      code: err.code,
      message: err.message
    });
    throw err;
  }
}
