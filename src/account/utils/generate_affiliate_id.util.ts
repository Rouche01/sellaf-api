import nanoid from 'nanoid';

const CUSTOM_ALPHABET =
  '012345670123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz89abcdefghijklmnopqrstuvwxyz';

export const generateAffiliateId = (): string => {
  const nanoId = nanoid.customAlphabet(CUSTOM_ALPHABET, 11);
  return `SLFA-${nanoId()}`;
};
