import { Badge } from '../../components/ui/badge';
import { formatDateAndTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Club, MatchSide, MatchSummary } from '../../services/types';
import { RESULT_LABELS, RESULT_STYLE } from './labels';

interface MatchScoreboardProps {
  match: MatchSummary;
  /** Para achar a sigla de cada clube, que a partida não traz. */
  clubs: Club[];
}

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
    <div className={cn('flex items-center gap-3', right ? 'justify-end' : 'justify-start')}>
      {right ? text : tag}
      {right ? tag : text}
    </div>
  );
}

// O placar de uma partida: os dois clubes com a sigla e a formação, o resultado no meio.
export function MatchScoreboard({ match, clubs }: MatchScoreboardProps) {
  const acronymOf = (clubId: number) => clubs.find((club) => club.id === clubId)?.acronym ?? '';

  return (
    <div
      role="group"
      aria-label="Placar"
      className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]"
    >
      <Team
        side={match.home}
        role="Mandante"
        acronym={acronymOf(match.home.club_id)}
        align="right"
      />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-4xl font-semibold tabular-nums">
          {match.home.goals}×{match.away.goals}
        </p>
        <p className="text-xs text-muted-foreground">{formatDateAndTime(match.played_at)}</p>
        <Badge variant="outline" className={RESULT_STYLE[match.result]}>
          {RESULT_LABELS[match.result]}
        </Badge>
      </div>
      <Team
        side={match.away}
        role="Visitante"
        acronym={acronymOf(match.away.club_id)}
        align="left"
      />
    </div>
  );
}
