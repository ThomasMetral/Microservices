FROM node

WORKDIR /usr/src/app

COPY score.js package.json ./

RUN npm install 

CMD ["node", "score.js"]