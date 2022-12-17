#!/usr/bin/env bash

set -euo pipefail

echo ""
echo "========================================================"
echo "==         STARTING KEYCLOAK CONFIGURATION            =="
echo "========================================================"


BASEDIR=$(dirname "$0")
source $BASEDIR/kc-config-helpers.sh
#${0%/*}/kc-config-helpers.sh

if [ "$KCADM" == "" ]; then
    KCADM=$KEYCLOAK_HOME/bin/kcadm.sh
    echo "Using $KCADM as the admin CLI."
fi

authenticateRealm master $KEYCLOAK_ADMIN $KEYCLOAK_ADMIN_PASSWORD $KC_MASTER_CLIENT_SECRET

${0%/*}/kc-realms.sh

echo "========================================================"
echo "==            KEYCLOAK CONFIGURATION DONE             =="
echo "========================================================"
echo ""