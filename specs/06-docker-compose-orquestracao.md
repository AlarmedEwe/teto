# Spec 06: Docker Compose & Orquestração Completa

Especificação técnica para orquestração em contêineres de todos os serviços da aplicação **Teto** (Banco de Dados PostgreSQL, API Backend Fastify e Aplicação Web Frontend Vite).

---

## 1. Objetivo & Arquitetura de Contêineres

O objetivo é permitir que qualquer desenvolvedor clone o repositório e execute toda a aplicação com um único comando:
```bash
docker compose up -d
```

### 1.1 Serviços Definidos
1. **`db` (PostgreSQL 16):**
   - Imagem: `postgres:16-alpine`.
   - Porta: `5432:5432`.
   - Volume: `postgres_data` persistente.
   - Healthcheck ativo com `pg_isready -U teto -d teto_db`.

2. **`backend` (Fastify API):**
   - Contexto de build: Raiz do monorepo (para resolução das dependências dos workspaces e `@teto/types`).
   - Dockerfile: `backend/Dockerfile`.
   - Porta: `3333:3333`.
   - Variáveis de ambiente:
     - `DATABASE_URL=postgresql://teto:tetopassword@db:5432/teto_db?schema=public`
     - `PORT=3333`
     - `NODE_ENV=development`
   - Ordem de inicialização: `depends_on: db (condition: service_healthy)`.
   - Script de entrada: aguarda o banco, executa migrations e seeds, e inicia o servidor Fastify com hot-reload.

3. **`frontend` (Vite + React):**
   - Contexto de build: Raiz do monorepo.
   - Dockerfile: `frontend/Dockerfile`.
   - Porta: `5173:5173`.
   - Ordem de inicialização: `depends_on: backend`.
   - Host configurado para `0.0.0.0` para aceitar conexões fora do container.

---

## 2. Dockerfiles e Arquivos a Serem Criados

```
teto/
├── backend/
│   ├── Dockerfile
│   └── entrypoint.sh          # Aguarda DB, roda migrations, seed e inicia backend
├── frontend/
│   └── Dockerfile
├── docker-compose.yml         # Orquestração dos 3 serviços
└── specs/
    └── 06-docker-compose-orquestracao.md
```

---

## 3. Critérios de Aceite
1. [ ] `backend/Dockerfile` construindo a imagem do backend com suporte aos workspaces do monorepo e `@teto/types`.
2. [ ] `frontend/Dockerfile` construindo a imagem do frontend com suporte aos workspaces e Vite exposto em `0.0.0.0:5173`.
3. [ ] `docker-compose.yml` orquestrando `db`, `backend` e `frontend` com dependências saudáveis (`service_healthy`).
4. [ ] Script `entrypoint.sh` no backend aplicando migrações e seed automaticamente ao iniciar.
5. [ ] Validação de subida e comunicação entre os 3 serviços.
