FROM node:20.11.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit-dev
RUN npm install --global serve
COPY ./src ./src
COPY ./public ./public
RUN npm run build
# COPY ./build ./build

CMD serve -s build