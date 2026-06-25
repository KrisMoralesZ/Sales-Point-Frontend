FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3010

CMD ["npm", "run", "dev", "--", "-p", "3010", "-H", "0.0.0.0"]
