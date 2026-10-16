# Mercado de Jogadores – Estudo de Caso SENAI/PE (Desenvolvedor Fullstack I)

Aplicação com backend (NestJS + Prisma), frontend (React + Vite) e banco PostgreSQL 16, que simula o mercado de jogadores de uma liga de futebol fictícia: jogadores, clubes, compra e venda com contrato de fidelidade, histórico, escalação, partidas e classificação.

## Pré-requisitos

| Ferramenta | Versão | Para quê |
| --- | --- | --- |
| Docker com Docker Compose | v2 | Sobe o banco, a API e a interface com um comando |
| PostgreSQL | 16 | Fornecido pela imagem `postgres:16-alpine`, não precisa instalar |
| Node.js | 22 LTS | Só para rodar fora do Docker (inclui o npm) |

## Como executar

1. Crie o arquivo de variáveis de ambiente a partir do exemplo (os valores já servem para desenvolvimento):

   ```bash
   cp .env.example .env
   ```

2. Suba tudo (banco, API e frontend):

   ```bash
   docker compose up -d
   ```

   Na primeira vez, o backend instala as dependências, gera o client do Prisma e aplica a migration do banco sozinho, então demora um pouco mais (vai da certo).

   Caso deseje polular o banco de dados, aguarde a migration ser aplicada.

3. Popular banco de dados (opcional):

   ```bash
   docker compose exec backend npm run db:seed
   ```


### Variáveis do frontend

O frontend lê o endereço da API de `VITE_API_URL` (padrão `http://localhost:3000/api/v1`). O Compose repassa a variável do `.env` ao serviço `frontend`. Ela só precisa mudar se a API sair de `localhost:3000`, e deve ser um endereço que o **navegador** alcança (não `http://backend:3000`, que só existe dentro do Docker). Se a porta ou o endereço do frontend mudarem, atualize também `CORS_ORIGIN`. O Vite lê as variáveis ao iniciar: depois de mudar, reinicie com `docker compose up -d --force-recreate frontend`.

## Endereços

| Serviço | URL |
| --- | --- |
| API (origem) | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| Documentação interativa (Swagger) | http://localhost:3000/docs |

Os endpoints da API ficam sob o prefixo `/api/v1` (por exemplo, `http://localhost:3000/api/v1/players`). A API aceita chamadas só da origem do frontend (`http://localhost:5173`), definida por `CORS_ORIGIN`.

## Banco de dados

As tabelas são criadas pelas migrations versionadas em `backend/prisma/migrations`, que o `docker compose up` aplica sozinho. O banco nasce vazio, sem jogadores, clubes, transações nem partidas.

Para recriar o banco do zero com Docker (apaga os dados):

```bash
docker compose down -v
docker compose up
```

Para recriar o banco do zero rodando fora do Docker (com o banco no ar):

```bash
cd backend
npx prisma migrate reset --force
```

O `migrate reset` já roda o seed (veja abaixo) ao terminar. Para criar o banco sem dados de exemplo, use `npx prisma migrate reset --force --skip-seed`.

### Dados de exemplo (opcional)

O banco nasce vazio de propósito. Para testar a interface e a API sem cadastrar tudo à mão, rode o seed (`backend/prisma/seed`):

```bash
# fora do Docker, dentro de backend/:
npm run db:seed
```

O seed cadastra 4 clubes, 27 jogadores contratados e 10 jogadores livres, com contratos, histórico de compras e escalação:

| Clube | Caixa | Escalação | Para testar |
| --- | --- | --- | --- |
| Águias FC (AGU) | 133,27 | 2-1-1 completa | Compra recusada por passar de 50% do caixa (jogador de 86,10) |
| Mangue FC (MAN) | 233,84 | 2-2 completa | Reserva doente (não pode ser escalado) e contrato já vencido (venda sem multa) |
| Delta FC (DEL) | 266,79 | 1-2-1 completa | Compra de qualquer livre |
| Leões do Sul (LEO) | 14,70 | sem escalação | Falta de caixa e partida recusada por escalação incompleta |

Os livres cobrem as cinco posições, as três condições, promessas de 17 a 22 anos, veteranos acima de 35 e nomes com acento. Nenhuma partida é criada: gere pela API para ver a classificação mudar.

Regras do seed:

- Rodar de novo não duplica nada: se o banco já tem clubes ou jogadores, ele avisa e sai. Para apagar tudo e recriar, use `npm run db:seed -- --reset`.
- O valor base e o valor de compra são calculados pelas mesmas funções da API, e o seed recusa um elenco cuja compra passaria de 50% do caixa. Os dados não contradizem as regras de negócio.
- As datas dos contratos são relativas a hoje, então a fidelidade nunca nasce vencida por acaso.

## Rodar sem Docker (opcional)

```bash
docker compose up -d db
cd backend && npm install && npx prisma migrate deploy && npm run start:dev
cd frontend && npm install && npm run dev
```

Comandos do Prisma devem ser executados de dentro da pasta `backend/`.

## Testes, lint e formatação (backend)

Todos terminam sozinhos, sem modo de observação:

```bash
cd backend
npm install
npm test                # testes automatizados, inclusive o cálculo do valor de mercado
npm run lint            # oxlint
npm run format:check    # prettier, só verifica, sem alterar arquivos
```

## Estrutura

```
backend/    API NestJS 12 (módulos: players, clubs, market, lineup, matches, prisma)
frontend/   React 19 + Vite
docker-compose.yml
```

## Bibliotecas utilizadas

Além da stack obrigatória (NestJS, React com Vite, PostgreSQL e Git):

### Backend

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/config` | Ler as variáveis de ambiente |
| `@nestjs/swagger` | Documentação interativa da API em `/docs` |
| `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` | ORM com migrations versionadas e consultas parametrizadas, e o driver do PostgreSQL |
| `class-validator`, `class-transformer` | Validar o corpo e os query params por DTO, com mensagens de erro centralizadas |
| `decimal.js` | Cálculos em moeda sem erro de ponto flutuante, com arredondamento do meio para longe do zero |
| `reflect-metadata`, `rxjs` | Exigidas pelo NestJS |
| `vitest`, `@vitest/coverage-v8`, `@nestjs/testing` | Testes automatizados |
| `oxlint` | Lint |
| `prettier` | Verificação de formatação |
| `dotenv` | Ler o `.env` da raiz no `prisma.config.ts` |
| `tsx` | Executar o seed em TypeScript (`npm run db:seed`) |
| `typescript`, `@nestjs/cli`, `@nestjs/schematics` | Compilar e executar o projeto Nest |

## Decisões e premissas

Pontos que o enunciado deixou em aberto ou que merecem registro:

- **Valores calculados:** overall, valor de mercado, valor do elenco, patrimônio, dias restantes, percentual de multa, pontos e posição na classificação nunca são gravados. O valor base é calculado uma vez, no cadastro, e gravado.
- **Moeda:** colunas `DECIMAL`, e todo cálculo usa `decimal.js`. O arredondamento é feito uma única vez, no resultado final, com o meio para longe do zero.
- **Filtros por valor de mercado e busca por nome:** como o valor de mercado não é coluna, a API busca os jogadores ativos, calcula, filtra, ordena e só então pagina, em memória. A busca ignora acentos e maiúsculas pela mesma regra.
- **Nome único do clube:** garantido no banco por um índice único em `lower(nome)`, que ignora maiúsculas e mantém os acentos, e também conferido na aplicação.
- **Datas:** o banco guarda `timestamptz`. A API aceita só `AAAA-MM-DDTHH:MM-03:00` e responde em `AAAA-MM-DDTHH:MM:SS-03:00`.
- **Restrições extras no banco:** além das exigidas, as listas de valores (posição, condição, tipo, situação, formação) e as faixas numéricas têm `CHECK` nas migrations.
- **Ids na URL:** valor que não é inteiro positivo, sem zero à esquerda, ou que passa de 2.147.483.647 responde 404, e não 400.
- **Consistência:** compra, venda, partida, escalação e alteração de condição para `DOENTE` gravam tudo numa única transação. Compra e venda usam gravações condicionais para não aceitar o mesmo jogador duas vezes em pedidos simultâneos.
- **Compra e venda** respondem `200`, como no enunciado.
- **Cache:** o `ETag` está desativado, para que toda consulta responda `200` com corpo, nunca `304`.
- **Escalação:** o `PUT` substitui a escalação inteira. Jogador vendido ou que passa a `DOENTE` sai da escalação, e o clube só volta a jogar quando escalar de novo.
- **Erros:** toda recusa devolve `{ "message": "..." }` em texto, sem stack trace, por um filtro global.

## Funcionalidades não implementadas

- **Backend:** nenhuma.
- **Frontend:** as telas ainda não foram implementadas; hoje há só o projeto base com Vite, Tailwind e shadcn/ui. 

## Uso de inteligência artificial

Ferramenta: Claude (Anthropic), usado pelo Claude Code no editor.

- **Cenários de teste:** usada para criar os cenários dos testes automatizados do backend (arquivos `*.spec.ts`), com casos válidos, inválidos e de limite a partir dos exemplos do enunciado. Os testes foram executados, e os que estavam incorretos foram ajustados.
- **Documentação:** usada para escrever as descrições e os exemplos da documentação Swagger (`/docs`) e este README.
- **Compatibilidade de dependências:** usada para resolver problemas de compatibilidade entre as versões das dependências.
- **Modelagem do banco de dados:** usada na modelagem do schema do banco.

**Responsabilidade:** a IA foi usada como assistente. As decisões de projeto, a revisão do código e a aprovação de cada alteração foram minhas, (Eu sou o guardião da palavra final).

