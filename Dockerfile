# Use Node.js 24.x
FROM node:24.10.0-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy remaining files
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]

