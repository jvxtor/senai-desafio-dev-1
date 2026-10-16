import { DataState } from '../../components/common/DataState';
import type { Lineup, SquadPlayer } from '../../services/types';
import { LineupEditor } from './LineupEditor';

interface LineupPanelProps {
  clubId: number;
  squad: SquadPlayer[];
  lineup: Lineup | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}

// A aba Escalação: carrega a escalação salva e abre o editor a partir dela.
export function LineupPanel({
  clubId,
  squad,
  lineup,
  isPending,
  error,
  onRetry,
}: LineupPanelProps) {
  return (
    <div className="min-h-0 flex-1 lg:overflow-y-auto">
      <DataState
        isPending={isPending}
        error={error}
        isEmpty={false}
        onRetry={onRetry}
        loadingLabel="Carregando a escalação…"
        empty={null}
      >
        {lineup && (
          // A chave refaz o formulário quando a escalação salva muda (salvou, vendeu um titular…).
          <LineupEditor
            key={`${lineup.formation ?? ''}:${lineup.players.map((player) => player.id).join(',')}`}
            clubId={clubId}
            squad={squad}
            saved={lineup}
          />
        )}
      </DataState>
    </div>
  );
}
