FROM node:20-alpine

RUN apk add --no-cache openjdk17-jre-headless bash

RUN npm install -g firebase-tools

WORKDIR /firebase

COPY firebase.json .

EXPOSE 9099 4000

CMD ["firebase", "emulators:start", "--only", "auth", "--project", "demo-visa-agent"]
