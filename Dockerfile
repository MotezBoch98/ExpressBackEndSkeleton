# Use an official Node.js runtime as a parent image
FROM node:16 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install node-pre-gyp globally
RUN npm install -g node-pre-gyp

# Copy the rest of the application code to the working directory
COPY . .

# Rebuild native modules
RUN npm rebuild bcrypt --build-from-source

# Use a smaller Node.js runtime for the final image
FROM node:16-slim

# Set the working directory in the container
WORKDIR /app

# Copy dependencies and application code from the build stage
COPY --from=build /app /app

# Expose the port the app runs on
EXPOSE 5000

# Define the command to run the app
CMD ["npm", "start"]
