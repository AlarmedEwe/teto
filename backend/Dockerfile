FROM node:22-alpine

WORKDIR /app

# Instalar dependências de sistema necessárias pelo Prisma no Alpine
RUN apk add --no-cache openssl bash netcat-openbsd

# Copiar arquivos de configuração raiz do monorepo
COPY package*.json tsconfig.base.json .nvmrc ./

# Copiar workspace types
COPY packages/types/ packages/types/

# Copiar workspace backend
COPY backend/ backend/

# Instalar dependências em todos os workspaces
RUN npm install

# Buildar o pacote compartilhado @teto/types
RUN npm run build --workspace=@teto/types

# Gerar Prisma Client
RUN npx prisma generate --schema=backend/prisma/schema.prisma

EXPOSE 3333

ENTRYPOINT ["/bin/bash", "/app/backend/entrypoint.sh"]
