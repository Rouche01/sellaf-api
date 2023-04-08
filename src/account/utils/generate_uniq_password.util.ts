import nanoid from 'nanoid';

const CUSTOM_ALPHABET =
  '012345670123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz89abcdefghijklmnopqrstuvwxyz-!*()@#$^%&+_';

export const generateUniquePassword = () => {
  const nanoId = nanoid.customAlphabet(CUSTOM_ALPHABET, 11);
  return `${nanoId()}-A0a`;
};
