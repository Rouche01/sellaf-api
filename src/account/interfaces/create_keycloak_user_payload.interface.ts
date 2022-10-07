import { CredentialRep } from './credential_rep.interface';
import { KeycloakUserData } from './keycloak_user_data.interface';
import { UserGroups } from './user_groups.interface';

export interface CreateKeycloakUser {
  userData: KeycloakUserData;
  username: string;
  userGroup: Array<UserGroups>;
  emailVerified?: boolean;
  userAttrs?: { [key: string]: any };
}

export interface CreateKeycloakUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  enabled?: boolean;
  emailVerified?: boolean;
  username: string;
  credentials: Array<CredentialRep>;
  groups: Array<UserGroups>;
  attributes: { [key: string]: any };
}
