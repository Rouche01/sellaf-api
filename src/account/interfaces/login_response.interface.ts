import { TransformedUser } from 'src/interfaces';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: TransformedUser;
}
