# Frontend – Passe, gestão da liga

Interface em React 19 + Vite + TypeScript do mercado de jogadores. O passo a passo completo (Docker, banco, variáveis, bibliotecas e decisões) está no [README da raiz](../README.md).

## Executar

Pelo Docker, na raiz do repositório: `docker compose up ` (a interface abre em http://localhost:5173).

Sem Docker, com a API no ar em `http://localhost:3000`:

```bash
cd frontend
npm install
npm run dev
```

## Variável de ambiente

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Endereço da API visto pelo navegador, com o prefixo `/api/v1` |

Se a API mudar de endereço, atualize também o `CORS_ORIGIN` da API.

## Comandos

```bash
npm test                # testes (Vitest + Testing Library), terminam sozinhos
npm run lint            # ESLint
npm run format:check    # Prettier, só verifica
npm run format          # Prettier, corrige os arquivos
npm run build           # tipos e build de produção
```

## Telas

| Rota | Tela |
| --- | --- |
| `/jogadores` | Lista com busca, filtros, ordenação e paginação; cadastro, edição, condição, compra e exclusão |
| `/clubes` | Lista de clubes com busca e ordenação, e cadastro |
| `/clubes/:id` | Caixa, valor do elenco e patrimônio; elenco com venda, escalação e histórico com exportação em CSV |
| `/partidas` | Última partida, histórico com filtro por clube e nova partida |
| `/partidas/:id` | Placar, jogadores em campo e os 6 duelos |
| `/classificacao` | Tabela da liga e últimas partidas |

## Estrutura

```
src/services/    chamadas à API (axios), uma por recurso
src/hooks/       hooks de dados (React Query) e chaves de cache
src/pages/       uma tela por rota
src/features/    componentes e regras de cada tela
src/components/  componentes compartilhados e o shadcn/ui (components/ui)
src/lib/         formatação, textos e tratamento de erros
```
