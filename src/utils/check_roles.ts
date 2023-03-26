import { AuthenticatedUser, Role } from 'src/interfaces';

export const checkUserRole = (roleName: Role, user: AuthenticatedUser) => {
  return user.realm_access.roles.includes(roleName);
};
