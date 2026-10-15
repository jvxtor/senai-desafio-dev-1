# Mercado de Jogadores – Estudo de Caso SENAI/PE (Desenvolvedor Fullstack I)

Aplicação com backend (NestJS + Prisma), frontend (React + Vite) e banco PostgreSQL 16.

## Requisitos

- Docker com plugin do Docker Compose
- Node.js 22 LTS e npm (caso for rodar fora do Docker)

## Como executar

1. Crie o arquivo de variáveis de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```


2. Suba tudo (banco, API e frontend):

   ```bash
   docker compose up
   ```

   Na primeira vez, o backend instala as dependências e aplica as migrations do banco sozinho. (vai demorar um pouco mais.. tenha fé)

## Endereços

| Serviço  | URL                          |
| -------- | ---------------------------- |
| API      | http://localhost:3000        |
| Frontend | http://localhost:5173        |
| Banco    | localhost:5432               |

## Banco de dados

As tabelas são criadas pelas migrations versionadas em `backend/prisma/migrations`.

Para recriar o banco do zero:

```bash
docker compose down -v
docker compose up
```

## Rodar sem Docker (opcional)

```bash
docker compose up -d db
cd backend && npm install && npx prisma migrate deploy && npm run start:dev
cd frontend && npm install && npm run dev
```

Comandos do Prisma devem ser executados de dentro da pasta `backend/`.

## Estrutura

```
backend/    API NestJS 12
frontend/   React 19 + Vite
docker-compose.yml
```

## Uso de inteligência artificial

- Resolver problemas compatibilidade de dependências
- Modelagem do banco de dados
- 
