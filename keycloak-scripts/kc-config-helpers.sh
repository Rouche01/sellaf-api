#!/usr/bin/env bash

set -euo pipefail

# the new realm is also set as enabled
function createRealm() {
    # arguments
    REALM_NAME=$1
    #
    $KCADM create realms -s realm="${REALM_NAME}" -s enabled=true
    EXISTING_REALM=$($KCADM get realms/$REALM_NAME)
    if [ "$EXISTING_REALM" == "" ]; then
        $KCADM create realms -s realm="${REALM_NAME}" -s enabled=true
    fi
}

# the new client is also set as enabled
function createClient() {
    # arguments
    REALM_NAME=$1
    CLIENT_ID=$2
    CLIENT_NAME=$3
    CLIENT_SECRET=$4
    #
    ID=$(getClient $REALM_NAME $CLIENT_ID)
    if [[ "$ID" == "" ]]; then
        $KCADM create clients -r $REALM_NAME -s clientId=$CLIENT_ID -s name=$CLIENT_NAME -s enabled=true \
        -s "clientAuthenticatorType=client-secret" -s secret=$CLIENT_SECRET \
        -s serviceAccountsEnabled=true -s authorizationServicesEnabled=true
    fi
    echo $(getClient $REALM_NAME $CLIENT_ID)
}

# get the object id of the client for a given clientId
function getClient () {
    # arguments
    REALM_NAME=$1
    CLIENT_ID=$2
    #
    ID=$($KCADM get clients -r $REALM_NAME --fields id,clientId | jq '.[] | select(.clientId==("'$CLIENT_ID'")) | .id')
    echo $(sed -e 's/"//g' <<< $ID)
}

# create a user for the given username if it doesn't exist yet and return the object id
function createUser() {
    # arguments
    REALM_NAME=$1
    USER_NAME=$2
    #
    USER_ID=$(getUser $REALM_NAME $USER_NAME)
    if [ "$USER_ID" == "" ]; then
        $KCADM create users -r $REALM_NAME -s "username=$USER_NAME" -s enabled=true
    fi
    echo $(getUser $REALM_NAME $USER_NAME)
}

# the object id of the user for a given username
function getUser() {
    # arguments
    REALM_NAME=$1
    USERNAME=$2
    #
    USER=$($KCADM get users -r $REALM_NAME -q username=$USERNAME | jq '.[] | select(.username==("'$USERNAME'")) | .id' )
    echo $(sed -e 's/"//g' <<< $USER)
}

# login to realm to get credentials for further request
function authenticateRealm() {
    #arguments
    REALM_NAME=$1
    USERNAME=$2
    PASSWORD=$3
    #
    $KCADM config credentials --server http://$HOST_FOR_KCADM:8888 --realm $REALM_NAME --user $USERNAME --password $PASSWORD
}

# create realm roles
function createRealmRole() {
    #arguments
    REALM_NAME=$1
    ROLE_NAME=$2
    ROLE_DESC=$3
    #
    ROLE_ID=$(getRealmRole $REALM_NAME $ROLE_NAME)
    if [ "$ROLE_ID" == "" ]; then
        $KCADM create roles -r $REALM_NAME -s name=$ROLE_NAME -s "description=$ROLE_DESC"
    fi
    echo $(getRealmRole $REALM_NAME $ROLE_NAME)
}

function getRealmRole() {
    #arguments
    REALM_NAME=$1
    ROLE_NAME=$2
    #
    ROLE=$($KCADM get roles -r $REALM_NAME | jq '.[] | select(.name==("'$ROLE_NAME'")) | .id' )
    echo $(sed -e 's/"//g' <<< $ROLE)
}

function createGroup() {
    #arguments
    REALM_NAME=$1
    GROUP_NAME=$2
    #
    GROUP_ID=$(getGroup $REALM_NAME $GROUP_NAME)
    if [ "$GROUP_ID" == "" ]; then
        $KCADM create groups -r $REALM_NAME -s name=$GROUP_NAME
    fi
    echo $(getGroup $REALM_NAME $GROUP_NAME)
}

function getGroup() {
    #arguments
    REALM_NAME=$1
    GROUP_NAME=$2
    #
    GROUP=$($KCADM get groups -r $REALM_NAME | jq '.[] | select(.name==("'$GROUP_NAME'")) | .id' )
    echo $(sed -e 's/"//g' <<< $GROUP)
}

function addRoleToGroup() {
    #arguments
    REALM_NAME=$1
    ROLE_NAME=$2
    GID=$3
    #
    $KCADM add-roles -r $REALM_NAME --gid $GID --rolename $ROLE_NAME
}