FROM node:8.16-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install