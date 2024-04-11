FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
