import { CredentialRep } from './credential_rep.interface';
import { UserGroups } from './user_groups.interface';

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
