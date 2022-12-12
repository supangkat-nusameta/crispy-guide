FROM node:19.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@9.2.0

RUN npm ci 
#--only=production

COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]