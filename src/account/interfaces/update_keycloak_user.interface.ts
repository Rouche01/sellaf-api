import { CredentialRep } from './credential_rep.interface';

export interface UpdateKeycloakUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  username?: string;
  credentials?: Array<CredentialRep>;
  attributes?: { [key: string]: any };
}
