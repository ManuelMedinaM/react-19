FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias primero para aprovechar el caché de capas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puertos: 5173 para el frontend (Vite) y 3001 para el backend (JSON Server)
EXPOSE 5173 3001

# Configurar variables de entorno para permitir override del puerto
ENV PORT=5173

# Ejecutar directamente el comando start del package.json
CMD ["npm", "start"] 