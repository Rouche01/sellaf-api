import { ConfirmationToken } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import compareAsc from 'date-fns/compareAsc';

export const generateConfirmationToken = (length = 9): string => {
  return new Array(length)
    .fill(0)
    .map(() => crypto.randomInt(9).toString())
    .reduce((prev, curr) => `${prev}${curr}`, '');
};

export const encryptToken = (
  tokenSalt: number,
  randomToken: string,
): Promise<string> => {
  return bcrypt.hash(randomToken, tokenSalt);
};

export const verifyConfirmationToken = (
  data: string,
  encrypted: string,
): Promise<boolean> => {
  return bcrypt.compare(data, encrypted);
};

export const isTokenExpired = (token: ConfirmationToken): boolean => {
  // compareInt is -1 when the current date is greater than the token expiry date
  const compareInt = compareAsc(token.expiresAt, new Date());
  return compareInt === -1 ? true : false;
};
