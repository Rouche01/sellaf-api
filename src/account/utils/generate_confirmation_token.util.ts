import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const generateConfirmationToken = (): string => {
  return new Array(9)
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
