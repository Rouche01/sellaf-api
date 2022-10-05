import nanoid from 'nanoid';

const CUSTOM_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export const generateUniqueUsername = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): string => {
  const nanoId = nanoid.customAlphabet(CUSTOM_ALPHABET, 4);
  return `${firstName}.${lastName}-${nanoId()}`;
};
