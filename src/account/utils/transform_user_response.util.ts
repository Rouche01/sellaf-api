import { User, UserRole } from '@prisma/client';

type UserResponse = User & {
  seller: {
    id: number;
  };
  affiliate: {
    id: number;
    affiliateCode: string;
  };
  userRoles: UserRole[];
};

export const transformUserResponse = (user: UserResponse) => {
  const roles = user.userRoles.map((userRole) => userRole.role);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.username,
    keycloakUserId: user.keycloakUserId,
    roles,
    ...(user.affiliate && { affiliateCode: user.affiliate.affiliateCode }),
  };
};
