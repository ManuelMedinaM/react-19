FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build frontend for production
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --production

# Copy server files
COPY --from=build /app/server ./server

# Copy built frontend
COPY --from=build /app/dist ./dist

# Add a script to start both services
RUN echo '#!/bin/sh \n \
cd /app \n \
PORT=$PORT node server/json-server.js \n' > /app/start.sh && \
chmod +x /app/start.sh

# Expose the port
EXPOSE 3001

# Start server
CMD ["/app/start.sh"] 