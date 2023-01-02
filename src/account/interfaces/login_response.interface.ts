import { Role } from '@prisma/client';

export interface TransformedUser {
  affiliateCode?: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  keycloakUserId: string;
  roles: Role[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: TransformedUser;
}
