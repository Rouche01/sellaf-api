import crypto from 'crypto';

export const computeSignature = (payload: Buffer, secret: string) => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload as unknown as string, 'utf-8')
    .digest('hex');
};

export const secureCompare = (a: string, b: string): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch) {
    b = a;
  }

  for (let i = 0, il = a.length; i < il; ++i) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};
