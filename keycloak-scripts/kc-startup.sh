function wait_for_keycloak() {
  local -r MAX_WAIT=60
  local curl_request
  local host_url="keycloak-server:8080"
  local wait_time

  curl_request="curl -I -f -s ${host_url}"
  wait_time=0

  # Waiting for the application to return a 200 status code.
  until ${curl_request}; do
    if [[ ${wait_time} -ge ${MAX_WAIT} ]]; then
      echo "The application service did not start within ${MAX_WAIT} seconds. Aborting.";
      exit 1
    else
      echo "Waiting (${wait_time}/${MAX_WAIT}) ...";
      sleep 1
      ((++wait_time))
    fi
  done

  echo "${host_url} is now up and running.";
}

# Waiting for Keycloak to start before proceeding with the configurations.
wait_for_keycloak

# Keycloak is running.
${0%/*}/kc-config.sh