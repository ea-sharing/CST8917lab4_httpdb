# Use the Node.js image
FROM node:19-bullseye
 
#RUN npm prune --omit=dev

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
#RUN npm install mongodb
#RUN npm install redis
#RUN npm install util
#RUN npm install express
#RUN npm install body-parser
#RUN npm install bson
#RUN npm install debug

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "--inspect", "server.js"]

