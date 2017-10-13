FROM node:alpine
WORKDIR /app
ADD . /app
RUN apk add --no-cache make gcc g++ python && yarn --production && yarn global add pm2
EXPOSE 8000
CMD ["pm2-docker","index.js"]
