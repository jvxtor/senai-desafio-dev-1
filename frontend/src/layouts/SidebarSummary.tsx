import { Clock, Swords, Trophy, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useMatches } from '../hooks/matches';
import type { NavCounts } from './useNavCounts';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function SummaryRow(props: { icon: LucideIcon; title: string; detail: string; to?: string }) {
  const { icon: Icon, title, detail, to } = props;

  const content = (
    <>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
      </span>
    </>
  );

  const className = 'flex items-center gap-3 rounded-lg';
  return to ? (
    <Link
      to={to}
      className={`${className} outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

// O resumo no fim da barra lateral: a liga, a última partida e o fuso dos horários.
export function SidebarSummary({ counts }: { counts: NavCounts }) {
  const matches = useMatches();
  const last = matches.data?.[0];

  const league =
    counts.clubs !== undefined && counts.players !== undefined
      ? `${plural(counts.clubs, 'clube', 'clubes')} · ${plural(counts.players, 'jogador', 'jogadores')}`
      : 'Carregando…';

  let lastDetail = 'Carregando…';
  if (matches.isSuccess) {
    lastDetail = last
      ? `${last.home.club_name} ${last.home.goals} × ${last.away.goals} ${last.away.club_name}`
      : 'Nenhuma partida jogada';
  }

  return (
    <section
      aria-label="Resumo da liga"
      className="mt-auto flex shrink-0 flex-col gap-3 rounded-xl border bg-background p-3"
    >
      <SummaryRow
        icon={Trophy}
        title={`Liga Fictícia ${new Date().getFullYear()}`}
        detail={league}
      />
      <SummaryRow
        icon={Swords}
        title="Última partida"
        detail={lastDetail}
        to={last ? `/partidas/${last.id}` : undefined}
      />
      <p className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        <Clock aria-hidden="true" className="size-3.5" />
        Horário de Brasília (UTC−3)
      </p>
    </section>
  );
}
