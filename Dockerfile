# Node.js version of your choice
ARG NODE_VERSION="18"

# Linux Alpine version of your choice
ARG ALPINE_VERSION="3.17"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} As development

USER root
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma/

ENV NODE_ENV development

# Installing prerequisites for bcrypt, then install node_modules,
# compile bcrypt and delete prerequisites for smaller docker image
RUN apk add --no-cache make gcc g++ python3 openssl1.1-compat &&  \
  npm ci && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python3

RUN apk add --no-cache postgresql-client

COPY . .
COPY ./wait-for-pg-and-exec.sh /wait-for-pg-and-exec.sh
RUN chmod +x /wait-for-pg-and-exec.sh

# Build for production
FROM development As builder

RUN npm run build
ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

# For production
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} As production

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma/

RUN apk add --no-cache postgresql-client

COPY ./wait-for-pg-and-exec.sh /wait-for-pg-and-exec.sh
RUN chmod +x /wait-for-pg-and-exec.sh

EXPOSE 4005

CMD ["/bin/sh", "-c", "/wait-for-pg-and-exec.sh"]