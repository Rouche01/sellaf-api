#!/usr/bin/env bash

set -euo pipefail

REALM_NAME='sellaf'
REALM_ROLES=('user' 'affiliate' 'seller' 'seller-admin' 'super-admin')
REALM_GROUPS=('AFFILIATE_USER_GROUP' 'STORE_OWNER_GROUP' 'SUPER_ADMIN_USER_GROUP')
AFFILIATE_ROLES=('user' 'affiliate')
STORE_OWNER_ROLES=('user' 'seller' 'seller-admin')
SUPER_ADMIN_ROLES=('user' 'seller' 'seller-admin' 'super-admin')

BASEDIR=$(dirname "$0")
source $BASEDIR/kc-config-helpers.sh

echo ""
echo "================================="
echo "setting up realm $REALM_NAME..."
echo "================================="
echo ""

createRealm $REALM_NAME

# enable the storage of admin events including their representation
$KCADM update events/config -r ${REALM_NAME} -s adminEventsEnabled=true -s adminEventsDetailsEnabled=true

# enable the storage of login events and define the expiration of a stored login event
$KCADM update events/config -r ${REALM_NAME} -s eventsEnabled=true -s eventsExpiration=259200

# define the login event types to be stored
$KCADM update events/config -r ${REALM_NAME} -s 'enabledEventTypes=["CLIENT_DELETE", "CLIENT_DELETE_ERROR", "CLIENT_INFO", "CLIENT_INFO_ERROR", "CLIENT_INITIATED_ACCOUNT_LINKING", "CLIENT_INITIATED_ACCOUNT_LINKING_ERROR", "CLIENT_LOGIN", "CLIENT_LOGIN_ERROR", "CLIENT_REGISTER", "CLIENT_REGISTER_ERROR", "CLIENT_UPDATE", "CLIENT_UPDATE_ERROR", "CODE_TO_TOKEN", "CODE_TO_TOKEN_ERROR", "CUSTOM_REQUIRED_ACTION", "CUSTOM_REQUIRED_ACTION_ERROR", "EXECUTE_ACTIONS", "EXECUTE_ACTIONS_ERROR", "EXECUTE_ACTION_TOKEN", "EXECUTE_ACTION_TOKEN_ERROR", "FEDERATED_IDENTITY_LINK", "FEDERATED_IDENTITY_LINK_ERROR", "GRANT_CONSENT", "GRANT_CONSENT_ERROR", "IDENTITY_PROVIDER_FIRST_LOGIN", "IDENTITY_PROVIDER_FIRST_LOGIN_ERROR", "IDENTITY_PROVIDER_LINK_ACCOUNT", "IDENTITY_PROVIDER_LINK_ACCOUNT_ERROR", "IDENTITY_PROVIDER_LOGIN", "IDENTITY_PROVIDER_LOGIN_ERROR", "IDENTITY_PROVIDER_POST_LOGIN", "IDENTITY_PROVIDER_POST_LOGIN_ERROR", "IDENTITY_PROVIDER_RESPONSE", "IDENTITY_PROVIDER_RESPONSE_ERROR", "IDENTITY_PROVIDER_RETRIEVE_TOKEN", "IDENTITY_PROVIDER_RETRIEVE_TOKEN_ERROR", "IMPERSONATE", "IMPERSONATE_ERROR", "INTROSPECT_TOKEN", "INTROSPECT_TOKEN_ERROR", "INVALID_SIGNATURE", "INVALID_SIGNATURE_ERROR", "LOGIN", "LOGIN_ERROR", "LOGOUT", "LOGOUT_ERROR", "PERMISSION_TOKEN", "PERMISSION_TOKEN_ERROR", "REFRESH_TOKEN", "REFRESH_TOKEN_ERROR", "REGISTER", "REGISTER_ERROR", "REGISTER_NODE", "REGISTER_NODE_ERROR", "REMOVE_FEDERATED_IDENTITY", "REMOVE_FEDERATED_IDENTITY_ERROR", "REMOVE_TOTP", "REMOVE_TOTP_ERROR", "RESET_PASSWORD", "RESET_PASSWORD_ERROR", "RESTART_AUTHENTICATION", "RESTART_AUTHENTICATION_ERROR", "REVOKE_GRANT", "REVOKE_GRANT_ERROR", "SEND_IDENTITY_PROVIDER_LINK", "SEND_IDENTITY_PROVIDER_LINK_ERROR", "SEND_RESET_PASSWORD", "SEND_RESET_PASSWORD_ERROR", "SEND_VERIFY_EMAIL", "SEND_VERIFY_EMAIL_ERROR", "TOKEN_EXCHANGE", "TOKEN_EXCHANGE_ERROR", "UNREGISTER_NODE", "UNREGISTER_NODE_ERROR", "UPDATE_CONSENT", "UPDATE_CONSENT_ERROR", "UPDATE_EMAIL", "UPDATE_EMAIL_ERROR", "UPDATE_PASSWORD", "UPDATE_PASSWORD_ERROR", "UPDATE_PROFILE", "UPDATE_PROFILE_ERROR", "UPDATE_TOTP", "UPDATE_TOTP_ERROR", "USER_INFO_REQUEST", "USER_INFO_REQUEST_ERROR", "VALIDATE_ACCESS_TOKEN", "VALIDATE_ACCESS_TOKEN_ERROR", "VERIFY_EMAIL", "VERIFY_EMAIL_ERROR"]'

# clients
CLIENT_ID=sellaf-api
CLIENT_NAME="SellafApi"
ID=$(createClient $REALM_NAME $CLIENT_ID $CLIENT_NAME $KC_SELLAF_API_CLIENT_SECRET)

# creating realm roles
for (( i = 0; i < ${#REALM_ROLES[@]}; ++i )); do
    SAVE=$(createRealmRole $REALM_NAME ${REALM_ROLES[i]} "role for ${REALM_ROLES[i]} permission")
done

# creating realm groups and mapping relevant roles to the groups
for (( i = 0; i < ${#REALM_GROUPS[@]}; ++i )); do
    SAVED=$(createGroup $REALM_NAME ${REALM_GROUPS[i]})
    case ${REALM_GROUPS[i]} in

      "AFFILIATE_USER_GROUP")
        for (( j = 0; j < ${#AFFILIATE_ROLES[@]}; ++j )); do
            addRoleToGroup $REALM_NAME ${AFFILIATE_ROLES[j]} $SAVED
        done
        ;;

      "STORE_OWNER_GROUP")
        for (( j = 0; j < ${#STORE_OWNER_ROLES[@]}; ++j )); do
            addRoleToGroup $REALM_NAME ${STORE_OWNER_ROLES[j]} $SAVED
        done
        ;;

      "SUPER_ADMIN_USER_GROUP")
        for (( j = 0; j < ${#SUPER_ADMIN_ROLES[@]}; ++j )); do
            addRoleToGroup $REALM_NAME ${SUPER_ADMIN_ROLES[j]} $SAVED
        done
        ;;

      *)
        echo "No Group Error"
        ;;

    esac
done

# set password policy and update the access token lifetime and session idle window
$KCADM update realms/$REALM_NAME \
-s 'passwordPolicy="specialChars(1) and upperCase(1) and lowerCase(1) and digits(1) and length(9) and notUsername and notEmail and passwordHistory(3)"' \
-s accessTokenLifespan=1200 -s ssoSessionIdleTimeout=3000

# $KCADM update clients/$ID -r $REALM_NAME -s name="My Client" -s protocol=openid-connect -s publicClient=true -s standardFlowEnabled=true -s 'redirectUris=["https://www.keycloak.org/app/*"]' -s baseUrl="https://www.keycloak.org/app/" -s 'webOrigins=["*"]'