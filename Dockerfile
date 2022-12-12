FROM node:18.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g yarn

COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]