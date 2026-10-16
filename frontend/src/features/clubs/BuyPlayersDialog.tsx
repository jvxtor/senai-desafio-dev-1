import { useState } from 'react';
import { DataState } from '../../components/common/DataState';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/filters/SearchInput';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePlayers } from '../../hooks/players';
import { formatMoney } from '../../lib/format';
import type { Player } from '../../services/types';
import { CONDITION_LABELS, CONDITION_STYLE, initialsOf, POSITION_LABELS } from '../players/labels';

interface BuyPlayersDialogProps {
  clubName: string;
  clubCash: number;
  onBuy: (player: Player) => void;
  onClose: () => void;
}

const PAGE_LIMIT = 50;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DELAY_MS = 300;

// Lista os jogadores livres; escolher um leva ao diálogo de compra, já com este clube.
export function BuyPlayersDialog({ clubName, clubCash, onBuy, onClose }: BuyPlayersDialogProps) {
  const [search, setSearch] = useState('');
  const term = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);

  const players = usePlayers({
    free: true,
    search: term.length >= MIN_SEARCH_LENGTH ? term : undefined,
    sort: 'name',
    page: 1,
    limit: PAGE_LIMIT,
  });

  const list = players.data?.data ?? [];
  const total = players.data?.meta.total_items ?? 0;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Comprar jogadores"
      description={`Jogadores livres para o ${clubName}. Caixa do clube: ${formatMoney(clubCash)}. A taxa e o limite de caixa são conferidos ao confirmar.`}
    >
      <SearchInput
        label="Buscar jogador livre"
        placeholder="Buscar jogador livre"
        title="Digite ao menos 2 letras para buscar"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="max-h-80 overflow-y-auto rounded-xl border">
        <DataState
          isPending={players.isPending}
          error={players.error}
          isEmpty={players.isSuccess && list.length === 0}
          onRetry={() => void players.refetch()}
          loadingLabel="Carregando jogadores livres…"
          empty={
            <>
              <p className="text-sm font-medium">Nenhum jogador livre encontrado</p>
              <p className="text-sm text-muted-foreground">
                {term ? 'Tente outro nome.' : 'Todos os jogadores já têm clube.'}
              </p>
            </>
          }
        >
          <ul className="divide-y">
            {list.map((player) => (
              <li key={player.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium"
                >
                  {initialsOf(player.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {POSITION_LABELS[player.position]} · {player.age} anos · overall{' '}
                    {player.overall}
                  </p>
                </div>
                <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
                  {CONDITION_LABELS[player.condition]}
                </Badge>
                <span className="w-16 text-right text-sm font-semibold tabular-nums">
                  {formatMoney(player.market_value)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Comprar ${player.name}`}
                  onClick={() => onBuy(player)}
                >
                  Comprar
                </Button>
              </li>
            ))}
          </ul>
        </DataState>
      </div>

      {total > PAGE_LIMIT && (
        <p className="text-xs text-muted-foreground">
          Mostrando os {PAGE_LIMIT} primeiros de {total} jogadores livres. Use a busca para achar os
          outros.
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </Modal>
  );
}
