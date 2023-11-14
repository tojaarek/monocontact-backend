FROM node:18.18.0-alpine

ENV PORT 8080

RUN mkdir /app

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

ADD . /app/

EXPOSE 8080

CMD ["node", "server.js"]