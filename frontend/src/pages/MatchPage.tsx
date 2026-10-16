import { ArrowLeft, HeartPulse } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { DataState } from '../components/common/DataState';
import { Badge } from '../components/ui/badge';
import { BallIcon } from '../features/matches/BallIcon';
import { MatchDuelsTable } from '../features/matches/MatchDuelsTable';
import { MatchPitch } from '../features/matches/MatchPitch';
import { RESULT_LABELS, RESULT_STYLE } from '../features/matches/labels';
import { useClubs } from '../hooks/clubs';
import { useMatch } from '../hooks/matches';
import { formatDateAndTime } from '../lib/format';
import type { Club, MatchSide } from '../services/types';

function Team(props: { side: MatchSide; role: string; acronym: string; align: 'right' | 'left' }) {
  const { side, role, acronym, align } = props;
  const right = align === 'right';

  const text = (
    <div className={right ? 'text-right' : 'text-left'}>
      <p className="text-lg font-semibold">{side.club_name}</p>
      <p className="text-xs text-muted-foreground">
        {role} · {side.formation}
      </p>
    </div>
  );
  const tag = (
    <span
      aria-hidden="true"
      className="grid size-12 place-items-center rounded-xl border bg-background text-sm font-semibold"
    >
      {acronym}
    </span>
  );

  return (
    <div className={`flex items-center gap-3 ${right ? 'justify-end' : 'justify-start'}`}>
      {right ? text : tag}
      {right ? tag : text}
    </div>
  );
}

function Legend({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

function MatchPage() {
  const id = Number(useParams().id);
  const match = useMatch(id);
  const clubs = useClubs();

  const acronymOf = (club: Club[] | undefined, clubId: number) =>
    club?.find((item) => item.id === clubId)?.acronym ?? '';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        to="/partidas"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para partidas
      </Link>

      <DataState
        isPending={match.isPending}
        error={match.error}
        isEmpty={false}
        onRetry={() => void match.refetch()}
        loadingLabel="Carregando a partida…"
        empty={null}
      >
        {match.data && (
          <>
            <section
              aria-label="Placar"
              className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]"
            >
              <Team
                side={match.data.home}
                role="Mandante"
                acronym={acronymOf(clubs.data, match.data.home.club_id)}
                align="right"
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-4xl font-semibold tabular-nums">
                  {match.data.home.goals}×{match.data.away.goals}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateAndTime(match.data.played_at)}
                </p>
                <Badge variant="outline" className={RESULT_STYLE[match.data.result]}>
                  {RESULT_LABELS[match.data.result]}
                </Badge>
              </div>
              <Team
                side={match.data.away}
                role="Visitante"
                acronym={acronymOf(clubs.data, match.data.away.club_id)}
                align="left"
              />
            </section>

            <section aria-label="Em campo" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Em campo</h2>
                  <p className="text-xs text-muted-foreground">
                    Titulares de cada clube na formação da partida e os valores usados nos duelos,
                    já com o efeito da condição.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Legend
                    icon={
                      <span className="grid size-4 place-items-center rounded-full bg-orange-500 text-white">
                        <HeartPulse aria-hidden="true" className="size-2.5" />
                      </span>
                    }
                  >
                    Mal condicionado
                  </Legend>
                  <Legend icon={<BallIcon className="size-4" />}>Gol no duelo</Legend>
                </div>
              </div>
              <MatchPitch match={match.data} />
            </section>

            <section aria-label="Duelos" className="flex flex-col gap-3">
              <div>
                <h2 className="text-base font-semibold">Duelos</h2>
                <p className="text-xs text-muted-foreground">
                  Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do
                  1º (o mais recuado) ao 4º (o mais avançado), pela ordem do elenco: o 4º ataca o
                  goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border bg-background">
                <MatchDuelsTable match={match.data} clubs={clubs.data ?? []} />
              </div>
            </section>

            <p className="text-xs text-muted-foreground">
              Esta tela aparece logo depois de jogar e ao abrir uma partida do histórico, com as
              formações dos clubes e os 6 duelos. Os valores e a condição de cada titular vêm
              gravados nos duelos devolvidos pela API. Quem está mal condicionado joga com 15% a
              menos em cada atributo.
            </p>
          </>
        )}
      </DataState>
    </div>
  );
}

export default MatchPage;
