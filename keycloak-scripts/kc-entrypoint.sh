#!/usr/bin/env bash

set -euo pipefail

export KCADM="opt/keycloak/bin/kcadm.sh"
export KCREG="opt/keycloak/bin/kcreg.sh"
export HOST_FOR_KCADM=keycloak-server

function main() {
    # Parameters
    local keycloak_cmd_arguments=("$@")

    ${0%/*}/kc-startup.sh &

    /opt/keycloak/bin/kc.sh "${keycloak_cmd_arguments[@]}" --http-port=8888
}

main "$@"



