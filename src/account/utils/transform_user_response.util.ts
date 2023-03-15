import { User, UserRole } from '@prisma/client';

type UserResponse = User & {
  seller?: {
    id: number;
    active: boolean;
    phoneNumber: string;
    businessName: string;
    address: string;
  };
  affiliate?: {
    id: number;
    affiliateCode: string;
    active: boolean;
    phoneNumber: string;
  };
  userRoles: UserRole[];
};

export const transformUserResponse = (user: UserResponse) => {
  const roles = user.userRoles.map((userRole) => userRole.role);
  console.log(user);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.username,
    keycloakUserId: user.keycloakUserId,
    phoneNumber: user?.affiliate.phoneNumber || user?.seller.phoneNumber,
    verified: user?.affiliate ? user.affiliate.active : user.seller.active,
    roles,
    ...(user.affiliate && { affiliateCode: user.affiliate.affiliateCode }),
  };
};
