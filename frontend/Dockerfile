FROM node:22-alpine

WORKDIR /app

# Copiar arquivos de configuração raiz do monorepo
COPY package*.json tsconfig.base.json .nvmrc ./

# Copiar workspace types
COPY packages/types/ packages/types/

# Copiar workspace frontend
COPY frontend/ frontend/

# Instalar dependências em todos os workspaces
RUN npm install

# Buildar o pacote compartilhado @teto/types
RUN npm run build --workspace=@teto/types

EXPOSE 5173

CMD ["npm", "run", "dev:frontend", "--", "--host", "0.0.0.0"]
