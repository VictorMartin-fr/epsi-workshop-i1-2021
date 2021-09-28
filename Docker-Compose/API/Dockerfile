#Generate API container for I1 Workshop project
FROM node:latest

#Change app directory
WORKDIR /usr/src/app

#Install dependencies
COPY ./sources/package*.json ./
RUN npm install

#Deplace application
COPY ./sources/ .

#Expose Port
EXPOSE 8080

#Run Node server
CMD [ "node", "server.js" ]