#!/usr/bin/env bash

set -euo pipefail

######################
### Setup realms via their script
######################

echo "setting up realms..."

${0%/*}/kc-realm-master.sh
${0%/*}/kc-realm-sellaf.sh