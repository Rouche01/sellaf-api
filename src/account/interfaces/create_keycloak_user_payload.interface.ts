import { UserGroups } from './user_groups.interface';

interface CredentialRep {
  type: string;
  temporary: boolean;
  value: string;
}

export interface CreateKeycloakUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  enabled?: boolean;
  username: string;
  credentials: Array<CredentialRep>;
  groups: Array<UserGroups>;
  attributes: { [key: string]: any };
}
