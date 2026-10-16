import { ArrowRight, ListOrdered, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { DataState } from '../components/common/DataState';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { useClubs } from '../hooks/clubs';
import { useMatches, useStandings } from '../hooks/matches';
import { formatDateAndTime } from '../lib/format';
import { cn } from '../lib/utils';

const RECENT_MATCHES = 3;

const COLUMNS = [
  { key: 'played', label: 'J', title: 'Jogos' },
  { key: 'wins', label: 'V', title: 'Vitórias' },
  { key: 'draws', label: 'E', title: 'Empates' },
  { key: 'losses', label: 'D', title: 'Derrotas' },
  { key: 'goals_for', label: 'GP', title: 'Gols marcados' },
  { key: 'goals_against', label: 'GC', title: 'Gols sofridos' },
  { key: 'goal_difference', label: 'SG', title: 'Saldo de gols' },
] as const;

const CRITERIA = [
  'Mais pontos',
  'Maior saldo de gols',
  'Mais gols marcados',
  'Nome do clube, de A a Z',
];

const CELL = 'px-3 py-3';

const signed = (value: number) =>
  value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0';

function StandingsPage() {
  const navigate = useNavigate();
  const standings = useStandings();
  const clubs = useClubs();
  const matches = useMatches();

  const rows = standings.data ?? [];
  const acronymOf = (clubId: number) => clubs.data?.find((club) => club.id === clubId)?.acronym;
  const recent = (matches.data ?? []).slice(0, RECENT_MATCHES);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 short:gap-3 lg:h-full">
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        description="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        action={
          <Button onClick={() => void navigate('/partidas?nova=1')}>
            <Plus aria-hidden="true" />
            Nova partida
          </Button>
        }
      />

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] gap-5 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:overflow-y-auto">
        <section
          aria-label="Tabela de classificação"
          className="flex min-h-0 flex-col self-start rounded-xl border bg-background"
        >
          <DataState
            isPending={standings.isPending}
            error={standings.error}
            isEmpty={standings.isSuccess && rows.length === 0}
            onRetry={() => void standings.refetch()}
            loadingLabel="Carregando a classificação…"
            empty={
              <>
                <p className="text-sm font-medium">Ainda não há clubes</p>
                <p className="text-sm text-muted-foreground">
                  Cadastre clubes para montar a classificação.
                </p>
              </>
            }
          >
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead className={cn(CELL, 'h-auto w-12 text-muted-foreground')}>#</TableHead>
                  <TableHead className={cn(CELL, 'h-auto text-muted-foreground')}>Clube</TableHead>
                  {COLUMNS.map((column) => (
                    <TableHead
                      key={column.key}
                      title={column.title}
                      className={cn(CELL, 'h-auto text-center text-muted-foreground')}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead
                    title="Pontos"
                    className={cn(CELL, 'h-auto text-center text-muted-foreground')}
                  >
                    Pts
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const idle = row.played === 0;

                  return (
                    <TableRow key={row.club_id}>
                      <TableCell className={CELL}>
                        <span
                          className={cn(
                            'grid size-6 place-items-center rounded-md text-xs font-medium tabular-nums',
                            row.position === 1
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {row.position}
                        </span>
                      </TableCell>
                      <TableCell className={CELL}>
                        <span className="flex items-center gap-3">
                          <span className="w-9 rounded bg-muted px-1.5 py-0.5 text-center text-[0.65rem] font-semibold">
                            {acronymOf(row.club_id) ?? '…'}
                          </span>
                          <Link
                            to={`/clubes/${row.club_id}`}
                            className="font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            {row.club_name}
                          </Link>
                        </span>
                      </TableCell>
                      {COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            CELL,
                            'text-center tabular-nums',
                            idle && 'text-muted-foreground',
                          )}
                        >
                          {column.key === 'goal_difference'
                            ? signed(row.goal_difference)
                            : row[column.key]}
                        </TableCell>
                      ))}
                      <TableCell className={cn(CELL, 'text-center font-semibold tabular-nums')}>
                        {row.points}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="border-t px-4 py-3 text-xs text-muted-foreground">
              J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols
              sofridos · SG: saldo de gols · Pts: pontos
            </p>
          </DataState>
        </section>

        <div className="flex flex-col gap-5 self-start">
          <section aria-label="Últimas partidas" className="rounded-xl border bg-background">
            <div className="border-b px-4 py-3">
              <h2 className="text-base font-semibold">Últimas partidas</h2>
              <p className="text-xs text-muted-foreground">Da mais recente para a mais antiga.</p>
            </div>
            {recent.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                {matches.isPending ? 'Carregando…' : 'Nenhuma partida jogada ainda.'}
              </p>
            ) : (
              <ul className="divide-y">
                {recent.map((match) => (
                  <li key={match.id}>
                    <Link
                      to={`/partidas/${match.id}`}
                      className="flex flex-col gap-1 px-4 py-3 outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatDateAndTime(match.played_at)}
                      </span>
                      <span className="flex items-center gap-2 text-sm">
                        <span className={cn(match.result === 'MANDANTE' && 'font-semibold')}>
                          {match.home.club_name}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
                          {match.home.goals} × {match.away.goals}
                        </span>
                        <span className={cn(match.result === 'VISITANTE' && 'font-semibold')}>
                          {match.away.club_name}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t px-4 py-3">
              <Link
                to="/partidas"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Ver todas as partidas
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </section>

          <section aria-label="Ordem da tabela" className="rounded-xl border bg-background">
            <div className="border-b px-4 py-3">
              <h2 className="text-base font-semibold">Ordem da tabela</h2>
              <p className="text-xs text-muted-foreground">
                Critérios de classificação, nesta ordem.
              </p>
            </div>
            <ol className="flex flex-col gap-3 px-4 py-4">
              {CRITERIA.map((criterion, index) => (
                <li key={criterion} className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-muted text-xs tabular-nums">
                    {index + 1}
                  </span>
                  {criterion}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <p className="shrink-0 text-xs text-muted-foreground short:hidden">
        {rows.length > 0 &&
          `Classificação de 1 a ${rows.length}, com os clubes sem partidas zerados. `}
        Pontos, saldo e posição são calculados a cada consulta, nunca gravados.
      </p>
    </div>
  );
}

export default StandingsPage;
