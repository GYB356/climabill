import * as crypto from 'crypto';
import * as base32 from 'hi-base32';
import * as QRCode from 'qrcode';

/**
 * Generate a random MFA secret
 */
export function generateSecret(email: string, issuer: string = 'ClimaBill') {
  // Generate a random secret
  const buffer = crypto.randomBytes(20);
  const secret = base32.encode(buffer).replace(/=/g, '');
  
  // Create otpauth URL for QR code
  const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  
  // Generate QR code
  return new Promise<{ secret: string; uri: string; qrCode: string }>((resolve, reject) => {
    QRCode.toDataURL(uri, (err, qrCode) => {
      if (err) {
        reject(err);
      } else {
        resolve({ secret, uri, qrCode });
      }
    });
  });
}

/**
 * Generate a recovery code for MFA
 */
export function generateRecoveryCode(): string {
  const buffer = crypto.randomBytes(10);
  const code = buffer.toString('hex').toUpperCase();
  
  // Format as XXXX-XXXX-XXXX-XXXX
  return code.match(/.{1,4}/g)?.join('-') || code;
}

/**
 * Verify a TOTP code
 */
export function verifyTOTP(secret: string, token: string): boolean {
  // Allow codes from adjacent periods to account for clock skew
  const window = 1; 
  
  try {
    const decodedSecret = base32.decode.asBytes(secret);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check current and adjacent time windows
    for (let i = -window; i <= window; i++) {
      const time = currentTime + (i * 30);
      if (generateTOTP(decodedSecret, time) === token) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Generate a TOTP code for a given time
 */
function generateTOTP(secret: Uint8Array, time: number): string {
  // Convert time to buffer
  const counter = Math.floor(time / 30);
  const buffer = Buffer.alloc(8);
  
  for (let i = 0; i < 8; i++) {
    buffer[7 - i] = counter & 0xff;
    counter = counter >> 8;
  }
  
  // Generate HMAC
  const hmac = crypto.createHmac('sha1', Buffer.from(secret));
  const hmacResult = hmac.update(buffer).digest();
  
  // Generate OTP
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const binary = ((hmacResult[offset] & 0x7f) << 24) |
                ((hmacResult[offset + 1] & 0xff) << 16) |
                ((hmacResult[offset + 2] & 0xff) << 8) |
                (hmacResult[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}
