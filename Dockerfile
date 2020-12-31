# docker build . -t itemsapi -f Dockerfile
# docker run --privileged -it -p 3000:3000 itemsapi
# docker run --privileged -it -p 3000:3000 itemsapi /bin/bash
# docker run --privileged -it -p 3000:3000 itemsapi/itemsapi
FROM node:14-alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache bash lmdb-dev lmdb-tools boost boost-dev libc6-compat gcompat build-base git 

COPY . /app/
RUN rm -Rf /app/node_modules
RUN rm -Rf /app/data
RUN mkdir -p /app/data
WORKDIR app

RUN npm install

RUN npm install pm2 -g

ENV PORT 3000
EXPOSE 3000

CMD ["pm2-runtime", "pm2.yaml"]
