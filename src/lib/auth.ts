import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret_key_change_me_in_production';

export async function signJwt(payload: any) {
  const secret = new TextEncoder().encode(JWT_SECRET_KEY);
  const alg = 'HS256';

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyJwt(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}
