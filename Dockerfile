FROM node:alpine
WORKDIR /app
ADD . /app
RUN apk add --no-cache make gcc g++ python && yarn --production
EXPOSE 8000
CMD ["node","index.js"]
