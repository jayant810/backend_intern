# Use Node.js 20 base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the frontend port
EXPOSE 5173

# Start the frontend in development mode, ensuring it is accessible from the host
CMD ["npm", "run", "dev", "--", "--host"]
