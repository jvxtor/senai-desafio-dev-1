# Frontend – Passe, gestão da liga

Interface em React 19 + Vite + TypeScript do mercado de jogadores. O passo a passo completo (Docker, banco, variáveis, bibliotecas e decisões) está no [README da raiz](../README.md).

## Executar

Pelo Docker, na raiz do repositório: `docker compose up` (a interface abre em http://localhost:5173). O Compose já passa o endereço da API ao frontend.

Sem Docker, com a API no ar em `http://localhost:3000`, crie o arquivo `frontend/.env` com o endereço da API e inicie:

```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
npm install
npm run dev
```

## Variável de ambiente

| Variável | Valor para desenvolvimento | Para quê |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Endereço da API visto pelo navegador, com o prefixo `/api/v1` |

- No Docker, o Compose usa `http://localhost:3000/api/v1` se a variável não estiver no `.env` da raiz.
- Fora do Docker, a variável é obrigatória: sem ela as chamadas não encontram a API. O Vite lê só o `.env` de `frontend/`, e não o da raiz.
- O endereço precisa ser um que o **navegador** alcança (`localhost`, e não `backend`). Se a API mudar de endereço, atualize também o `CORS_ORIGIN` da API.
- O Vite lê as variáveis ao iniciar: depois de mudar, reinicie.

## Comandos

```bash
npm test                # testes (Vitest + Testing Library), terminam sozinhos
npm run lint            # ESLint
npm run format:check    # Prettier, só verifica
npm run format          # Prettier, corrige os arquivos
npm run build           # tipos e build de produção
```

Os testes cobrem a formatação de dinheiro e datas, a validação e a sugestão de sigla do clube, os filtros de jogadores, a prévia dos atributos e o formulário de novo clube.

## Telas

| Rota | Tela |
| --- | --- |
| `/jogadores` | Lista com busca, filtros, ordenação e paginação; cadastro com prévia dos atributos, edição, condição, compra e exclusão; clicar na linha abre o painel do jogador |
| `/clubes` | Lista de clubes com busca e ordenação, e cadastro com sigla sugerida |
| `/clubes/:id` | Caixa, valor do elenco e patrimônio; abas de elenco (com venda), escalação (formação, titulares, campo e reservas) e histórico (filtros, resumo e exportação em CSV) |
| `/partidas` | Última partida, histórico com filtro por clube e nova partida |
| `/partidas/:id` | Placar, jogadores em campo e os 6 duelos |
| `/classificacao` | Tabela da liga, últimas partidas e a ordem dos critérios |

## Celular

Abaixo de 1024px de largura, a barra lateral dá lugar a uma barra fixa no topo com o botão de menu. O botão abre um painel lateral com o mesmo conteúdo da barra do computador (telas com contadores, lista de clubes e horário de Brasília), e tocar numa tela ou num clube fecha o painel. As tabelas rolam dentro do próprio quadro, sem rolagem lateral da página.

## Estrutura

```
src/services/    chamadas à API (axios), uma por recurso
src/hooks/       hooks de dados (React Query) e chaves de cache
src/pages/       uma tela por rota
src/features/    componentes e regras de cada tela (jogadores, clubes, partidas)
src/layouts/     estrutura da página: barra lateral, painel do celular e trilha de navegação
src/components/  componentes compartilhados e o shadcn/ui (components/ui)
src/lib/         formatação, textos e tratamento de erros
src/test/        configuração dos testes
```

As chamadas à API ficam só em `services/` e `hooks/`. A tela mostra o que a API devolve e não recalcula valor de mercado, overall, taxa, multa, comissão, placar nem classificação.
