# Imagen base con Node.js
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Exponer el puerto del backend
# Exponer el puerto del backend
EXPOSE 3000

# Comando para generar Prisma y arrancar NestJS
CMD npx prisma generate && npm run start:dev