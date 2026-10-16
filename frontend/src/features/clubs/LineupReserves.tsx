import { Lock } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import type { SquadPlayer } from '../../services/types';
import { PlayerAvatar } from '../players/PlayerAvatar';
import { CONDITION_LABELS, CONDITION_STYLE, POSITION_LABELS } from '../players/labels';
import { compareSquad } from './lineup';

interface LineupReservesProps {
  /** Os jogadores do elenco que não estão entre os titulares escolhidos. */
  players: SquadPlayer[];
}

export function LineupReserves({ players }: LineupReservesProps) {
  const ordered = [...players].sort(compareSquad);

  return (
    <section
      aria-label="Reservas"
      className="flex flex-col gap-3 rounded-xl border bg-background p-4"
    >
      <div>
        <h3 className="text-base font-semibold">Reservas</h3>
        <p className="text-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
      </div>

      {ordered.length === 0 ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
          Todos os jogadores do elenco estão escalados.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordered.map((player) => (
            <li key={player.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <PlayerAvatar name={player.name} position={player.position} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {POSITION_LABELS[player.position]}
                  </p>
                </div>
                <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                  {CONDITION_LABELS[player.condition]}
                </Badge>
              </div>
              {player.condition === 'DOENTE' && (
                <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                  Doente não pode ser escalado.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
