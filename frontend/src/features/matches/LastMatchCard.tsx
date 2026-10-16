import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { Club, MatchSummary } from '../../services/types';
import { MatchScoreboard } from './MatchScoreboard';

interface LastMatchCardProps {
  match: MatchSummary;
  clubs: Club[];
  /** Quando a lista está filtrada por um clube, o nome dele aparece no título. */
  clubName?: string;
  onOpen: (match: MatchSummary) => void;
}

// A partida mais recente em destaque, acima da lista.
export function LastMatchCard({ match, clubs, clubName, onOpen }: LastMatchCardProps) {
  return (
    <section
      aria-label="Última partida"
      className="flex shrink-0 flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          Última partida
          {clubName && <span className="font-normal text-muted-foreground"> · {clubName}</span>}
        </h2>
        <Button variant="outline" size="sm" onClick={() => onOpen(match)}>
          Ver partida completa
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <MatchScoreboard match={match} clubs={clubs} />
    </section>
  );
}
