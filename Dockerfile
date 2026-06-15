FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Exponer el puerto
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
