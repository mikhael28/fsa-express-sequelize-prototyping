FROM node:8.8.1

RUN mkdir -p /usr/app

WORKDIR /usr/app

ADD package.json .
RUN npm install --quiet

ADD . /usr/app

EXPOSE 80

CMD ["npm", "start"]
