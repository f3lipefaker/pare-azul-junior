# Use a imagem Node.js como imagem base
FROM node:alpine

# Crie um diretório de trabalho dentro do contêiner
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Copie os arquivos de código-fonte da sua aplicação para o diretório de trabalho no contêiner
COPY . .

# Instale as dependências da aplicação
RUN npm install

# Exponha a porta 80, que é a porta em que a aplicação estará ouvindo
EXPOSE 4000

# Comando para iniciar a aplicação quando o contêiner for executado
CMD ["npm", "start"]