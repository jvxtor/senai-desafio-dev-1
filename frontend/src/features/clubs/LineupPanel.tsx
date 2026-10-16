import { Pencil } from 'lucide-react';
import { DataState } from '../../components/common/DataState';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import type { Lineup, Player } from '../../services/types';
import { CONDITION_LABELS, CONDITION_STYLE, initialsOf } from '../players/labels';
import { SECTOR_LABELS, SECTORS_TOP_DOWN, countInSector, sectorOf, type Sector } from './lineup';

interface LineupPanelProps {
  lineup: Lineup | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  onEdit: () => void;
}

const LINEUP_SIZE = 5;

function StarterCard({ player }: { player: Player }) {
  return (
    <div className="flex min-w-44 items-center gap-2.5 rounded-xl border bg-background p-2.5">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium"
      >
        {initialsOf(player.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {player.position} · overall {player.overall}
        </p>
      </div>
      <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
        {CONDITION_LABELS[player.condition]}
      </Badge>
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex min-w-44 items-center justify-center rounded-xl border border-dashed p-2.5 text-xs text-muted-foreground">
      Vaga livre
    </div>
  );
}

function SectorRow({
  sector,
  expected,
  players,
}: {
  sector: Sector;
  expected: number;
  players: Player[];
}) {
  const free = Math.max(0, expected - players.length);

  return (
    <div className="grid gap-2 sm:grid-cols-[6.5rem_1fr] sm:items-center">
      <p className="text-xs font-medium text-muted-foreground">{SECTOR_LABELS[sector]}</p>
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <StarterCard key={player.id} player={player} />
        ))}
        {Array.from({ length: free }, (_, index) => (
          <EmptySlot key={index} />
        ))}
      </div>
    </div>
  );
}

// A escalação vista de cima: ataque no alto, goleiro embaixo; vaga sem titular fica pontilhada.
export function LineupPanel({ lineup, isPending, error, onRetry, onEdit }: LineupPanelProps) {
  const formation = lineup?.formation ?? null;
  const starters = lineup?.players ?? [];

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background lg:max-h-full">
      <DataState
        isPending={isPending}
        error={error}
        isEmpty={formation === null}
        onRetry={onRetry}
        loadingLabel="Carregando a escalação…"
        empty={
          <>
            <p className="text-sm font-medium">Este clube ainda não tem escalação</p>
            <p className="text-sm text-muted-foreground">
              Sem os {LINEUP_SIZE} titulares, o clube não joga partidas.
            </p>
            <Button onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Montar escalação
            </Button>
          </>
        }
      >
        {formation && (
          <>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Formação {formation}</h3>
                <Badge variant={starters.length === LINEUP_SIZE ? 'secondary' : 'outline'}>
                  {starters.length === LINEUP_SIZE
                    ? 'Completa'
                    : `Incompleta · ${starters.length} de ${LINEUP_SIZE}`}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil aria-hidden="true" />
                Editar escalação
              </Button>
            </div>
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-4">
              {SECTORS_TOP_DOWN.filter((sector) => countInSector(formation, sector) > 0).map(
                (sector) => (
                  <SectorRow
                    key={sector}
                    sector={sector}
                    expected={countInSector(formation, sector)}
                    players={starters.filter((player) => sectorOf(player.position) === sector)}
                  />
                ),
              )}
              {starters.length < LINEUP_SIZE && (
                <p className="text-xs text-muted-foreground">
                  Com menos de {LINEUP_SIZE} titulares o clube não joga partidas. Um jogador que
                  fica doente sai da escalação sozinho.
                </p>
              )}
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}
