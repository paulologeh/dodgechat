FROM node:alpine3.18 AS build

WORKDIR /build
COPY package.json package.json
COPY yarn.lock yarn.lock

COPY . .
RUN yarn

COPY public/ public
COPY src/ src
RUN yarn build

FROM httpd:alpine as final
WORKDIR /var/www/build
COPY --from=build /build/build/ .