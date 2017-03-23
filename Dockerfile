FROM node:6.9
MAINTAINER Mateusz Rzepa @cigolpl
RUN apt-get update
RUN npm install yarn -g 

RUN mkdir /app
WORKDIR /app

COPY package.json /app/
ADD . /app

RUN yarn install 

EXPOSE 3000

CMD ["npm", "start"]
