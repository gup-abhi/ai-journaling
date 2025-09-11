import { jwtVerify, createRemoteJWKSet } from 'jose';
import 'dotenv/config';

// Use your Supabase JWKS URL
const PROJECT_JWKS = createRemoteJWKSet(
  new URL(process.env.SUPABASE_PROJECT_JWKS)
);

/**
 * Verifies the provided JWT against the project's JSON Web Key Set.
 */
export async function verifyProjectJWT(token) {
  try {
    const data = await jwtVerify(token, PROJECT_JWKS, {
      issuer: process.env.SUPABASE_ISSUER_URL,
      audience: "authenticated"
    });

    // console.log(data)

    return data;
  } catch (err) {
    console.error("JWT verification failed:", err);
    throw err;
  }
}

// Example usage
// const token = "YOUR_JWT_HERE";
// verifyProjectJWT(token).then(console.log).catch(console.error);
