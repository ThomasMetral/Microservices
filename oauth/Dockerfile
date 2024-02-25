FROM node

WORKDIR /usr/src/app

COPY oauth.js package.json ./
COPY ./public/*  ./public/

RUN npm install 

CMD ["node", "oauth.js"]