# Backend – API do mercado de jogadores

API REST em NestJS 12 + Prisma 7 + PostgreSQL 16 da liga de futebol fictícia: jogadores, clubes, compra e venda com contrato de fidelidade, histórico com exportação em CSV, escalação, partidas e classificação. O passo a passo completo (Docker, banco, variáveis, bibliotecas e decisões) está no [README da raiz](../README.md).

## Executar

Pelo Docker, na raiz do repositório: `docker compose up` (a API fica em http://localhost:3000). O contêiner instala as dependências, gera o client do Prisma e aplica as migrations sozinho.

Sem Docker, com o banco no ar (`docker compose up -d db` na raiz) e o `.env` criado na raiz a partir do `.env.example`:

```bash
cd backend
npm install
npx prisma migrate deploy
npm run start:dev
```

Os comandos do Prisma devem ser executados de dentro de `backend/`.

## Endereços

| O quê | URL |
| --- | --- |
| API (origem) | http://localhost:3000 |
| Prefixo dos endpoints | `/api/v1` (por exemplo, `http://localhost:3000/api/v1/players`) |
| Documentação interativa (Swagger) | http://localhost:3000/docs |

## Variáveis de ambiente

Lidas do `.env` da raiz do repositório (o modelo está em `.env.example`):

| Variável | Para quê |
| --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL |
| `PORT` | Porta da API (padrão 3000) |
| `CORS_ORIGIN` | Única origem aceita pela API, a do frontend (`http://localhost:5173`). `*` não é usado, e a API não sobe sem a variável |

## Banco de dados

As tabelas vêm das migrations versionadas em `prisma/migrations`. O banco nasce vazio.

```bash
npx prisma migrate deploy                   # cria as tabelas
npx prisma migrate reset --force --skip-seed   # apaga tudo e recria, sem dados de exemplo
```

### Dados de exemplo (opcional)

```bash
npm run db:seed              # 4 clubes, 27 jogadores contratados e 10 livres, com escalação
npm run db:seed -- --reset   # apaga tudo e recria os dados de exemplo
```

Rodar de novo não duplica nada: se o banco já tem clubes ou jogadores, o seed avisa e sai. Os valores são calculados pelas mesmas funções da API. Os dados e as regras do seed estão no README da raiz.

## Endpoints

| Recurso | Endpoints |
| --- | --- |
| Jogadores | `POST /players`, `GET /players`, `GET /players/:id`, `PUT /players/:id`, `PATCH /players/:id/condition`, `DELETE /players/:id` |
| Clubes | `POST /clubs`, `GET /clubs`, `GET /clubs/:id` |
| Compra e venda | `POST /players/:id/buy`, `POST /players/:id/sell` |
| Histórico | `GET /clubs/:id/transactions`, `GET /clubs/:id/transactions/export` (CSV) |
| Escalação | `PUT /clubs/:id/lineup`, `GET /clubs/:id/lineup` |
| Partidas | `POST /matches`, `GET /matches`, `GET /matches/:id` |
| Classificação | `GET /standings` |

Todo erro volta como `{ "message": "..." }`, sem stack trace: `400` para dado inválido, `404` para recurso inexistente e `409` para regra de negócio. Os detalhes de cada rota, com exemplos, estão no Swagger.

## Comandos

Todos terminam sozinhos, sem modo de observação:

```bash
npm test                # testes automatizados, inclusive o cálculo do valor de mercado e os dados do seed
npm run lint            # oxlint
npm run format:check    # Prettier, só verifica, sem alterar arquivos
npm run format          # Prettier, corrige os arquivos
npm run build           # compila para dist/
```

## Estrutura

```
src/players/     jogadores: cadastro, edição, condição, listagem e cálculo do overall e dos valores
src/clubs/       clubes: cadastro, listagem, elenco, caixa e patrimônio
src/market/      compra, venda, multa, comissão, histórico e exportação em CSV
src/lineup/      formações e escalação
src/matches/     partidas, duelos e classificação
src/common/      tratamento central de erros, ids da URL, datas, dinheiro, textos e registro de requisições
src/prisma/      acesso ao banco
prisma/          schema, migrations e seed
```

Cada módulo separa o controlador (rota e validação por DTO), o serviço (regra e acesso ao banco) e as funções de cálculo, que ficam num único lugar e são testadas sem banco.

## Registro de requisições

Cada requisição gera uma linha no log da aplicação, com data e hora, método, caminho e status, pelo `Logger` do NestJS (por exemplo, `GET /api/v1/players 200`).
