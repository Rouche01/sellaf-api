import nanoid from 'nanoid';

const CUSTOM_ALPHABET =
  '012345670123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz89abcdefghijklmnopqrstuvwxyz';

export const generateTransactionRef = (): string => {
  const nanoId = nanoid.customAlphabet(CUSTOM_ALPHABET, 15);
  return `SELLAF-${nanoId()}`;
};
