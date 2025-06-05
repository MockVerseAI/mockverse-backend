FROM node:20-slimMore actions

WORKDIR /app

COPY package* .
RUN npm install

COPY . .

EXPOSE 8080

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

CMD ["node", "--experimental-loader=newrelic/esm-loader.mjs", "./src/index.js"]