import bcrypt from 'bcrypt';
import crypto from 'crypto';

const generateRandomToken = (): string => {
  return new Array(9)
    .fill(0)
    .map(() => crypto.randomInt(9).toString())
    .reduce((prev, curr) => `${prev}${curr}`, '');
};

export const generateConfirmationToken = (
  tokenSalt: number,
): Promise<string> => {
  return bcrypt.hash(generateRandomToken(), tokenSalt);
};
