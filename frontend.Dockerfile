FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code (excluding server directory)
COPY . .

# Expose Vite port
EXPOSE 5173

ENV VITE_API_URL=http://localhost:3001

# Start Vite dev server
CMD ["npm", "run", "dev"] 