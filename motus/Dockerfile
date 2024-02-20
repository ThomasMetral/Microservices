FROM node

WORKDIR /usr/src/app

COPY motus.js package.json ./
COPY ./public/*  ./public/

RUN npm install 

CMD ["node", "motus.js"]