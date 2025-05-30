FROM node:20-slim

WORKDIR /app

COPY package* .
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "--experimental-loader=newrelic/esm-loader.mjs", "./src/index.js"]