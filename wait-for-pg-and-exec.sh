#!/usr/bin/env sh
# wait-for-postgres.sh

set -e

echo "Working.. "$1""

# Login for user (`-U`) and once logged in execute quit ( `-c \q` )
# If we can not login sleep for 1 sec
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "dev-db" "postgres" -U "rouche" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# exec node -v

>&2 echo "Postgres is up - executing command"

exec npm run start:dev