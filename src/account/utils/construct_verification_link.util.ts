export const constructVerificationLink = (
  frontendUrl: string,
  confirmationToken: string,
  email: string,
) => {
  return encodeURI(
    `${frontendUrl}/account/verify?token=${confirmationToken}&email=${email}`,
  );
};
