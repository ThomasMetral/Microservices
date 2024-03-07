FROM node

WORKDIR /usr/src/app

COPY motus.js package.json ./
COPY ./public/*  ./public/
COPY ./data/*  ./data/

RUN npm install 

CMD ["node", "motus.js"]