FROM ubuntu:22.04

FROM node:20

# Install dependencies and Chrome browser
RUN apt-get update
RUN apt install unzip
COPY chrome_114_amd64.deb ./
RUN apt install ./chrome_114_amd64.deb -y
RUN wget https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip
RUN unzip chromedriver_linux64.zip
RUN mv chromedriver /usr/bin/chromedriver
RUN google-chrome --version
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port for the server
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
