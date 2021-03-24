FROM node:latest

WORKDIR /app

COPY . /app
COPY app.js ./
COPY package*.json ./
COPY models ./models
COPY bin ./bin
COPY authentication ./authentication
COPY controllers ./controllers
COPY routes ./routes

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
#CMD [ "nodemon" ]