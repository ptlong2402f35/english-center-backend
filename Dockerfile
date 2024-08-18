# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-slim

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
COPY . .
# RUN yarn global add pm2

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
# CMD npx sequelize-cli db:migrate; pm2 start bin/www; pm2 log www
CMD npx sequelize-cli db:migrate; npm run start
