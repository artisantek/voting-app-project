# Use an official lightweight Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy Source Code
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on (matching server.js port)
EXPOSE 80

# Define the command to run the application
CMD ["node", "server.js"]