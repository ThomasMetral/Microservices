FROM node

WORKDIR /usr/src/app

COPY session.js package.json ./
COPY ./public/*  ./public/

RUN npm install 

CMD ["node", "session.js"]