import * as crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import * as qrcode from 'qrcode';

/**
 * Generate a TOTP secret for MFA
 * @param email User's email
 * @param issuer App name
 * @returns Object containing secret, URI, and QR code
 */
export async function generateSecret(email: string, issuer: string = 'ClimaBill') {
  // Generate a random secret
  const secret = crypto.randomBytes(20).toString('hex');
  
  // Create a TOTP object
  const totp = new OTPAuth.TOTP({
    issuer,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromHex(secret)
  });
  
  // Get the URI for the QR code
  const uri = totp.toString();
  
  // Generate QR code
  const qrCode = await qrcode.toDataURL(uri);
  
  return { secret, uri, qrCode };
}

/**
 * Verify a TOTP code
 * @param secret TOTP secret
 * @param token Token to verify
 * @returns Boolean indicating if token is valid
 */
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    // Create a TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: 'ClimaBill',
      label: 'user',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(secret)
    });
    
    // Verify the token
    const delta = totp.validate({ token });
    
    // delta is null if the token is invalid
    // otherwise it's the time step difference
    return delta !== null;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Generate a recovery code for MFA
 * @returns Recovery code string
 */
export function generateRecoveryCode(): string {
  // Generate a random 12-character recovery code
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}
