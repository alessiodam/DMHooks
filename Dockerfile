FROM node:20-alpine

WORKDIR /home/node/app

COPY . .

RUN npm i

EXPOSE 3000

CMD [ "npm", "start" ]
