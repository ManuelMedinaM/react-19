FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy only server files
COPY server/ ./server/

# Expose JSON Server port
EXPOSE 3001

# Start JSON server
CMD ["npm", "run", "server"] 