import { Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataState } from '../components/common/DataState';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/ui/button';
import { BuyPlayerDialog } from '../features/players/BuyPlayerDialog';
import { ConditionDialog } from '../features/players/ConditionDialog';
import { DeletePlayerDialog } from '../features/players/DeletePlayerDialog';
import { PlayerCreatedDialog } from '../features/players/PlayerCreatedDialog';
import { PlayerDetailsSheet } from '../features/players/PlayerDetailsSheet';
import { PlayerFormDialog } from '../features/players/PlayerFormDialog';
import { PlayersFilterBar } from '../features/players/PlayersFilterBar';
import { PlayersTable } from '../features/players/PlayersTable';
import { PlayersToolbar } from '../features/players/PlayersToolbar';
import { usePlayersFilters } from '../features/players/usePlayersFilters';
import { useClubs } from '../hooks/clubs';
import { usePlayers } from '../hooks/players';
import type { Player } from '../services/types';

type DialogState =
  | { type: 'create' }
  | { type: 'edit' | 'condition' | 'delete' | 'buy' | 'details' | 'created'; player: Player }
  | null;

function PlayersPage() {
  const filters = usePlayersFilters();
  const players = usePlayers(filters.filters);
  const clubs = useClubs();
  const [dialog, setDialog] = useState<DialogState>(null);

  const clubsById = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club] as const)),
    [clubs.data],
  );

  const clubNameOf = (player: Player) =>
    player.club_id === null ? undefined : clubsById.get(player.club_id)?.name;

  const list = players.data?.data ?? [];
  const meta = players.data?.meta;
  const currentPage = filters.filters.page ?? 1;
  const close = () => setDialog(null);

  // Excluir o único jogador da última página deixaria a tela numa página vazia.
  function handleDeleted() {
    if (list.length === 1 && currentPage > 1) filters.setPage(currentPage - 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 short:gap-3 lg:h-full">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-xl border bg-background text-primary"
          >
            <Users className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jogadores</h1>
            <p className="mt-1 text-sm text-muted-foreground short:hidden">
              Cadastre jogadores, acompanhe os indicadores e compre os que estão livres.
            </p>
          </div>
        </div>
        <Button onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" />
          Novo jogador
        </Button>
      </header>

      <PlayersFilterBar
        draft={filters.draft}
        applied={filters.filters}
        errors={filters.errors}
        searchInput={filters.searchInput}
        clubs={clubs.data ?? []}
        hasFilters={filters.hasBarFilters}
        onSearchChange={filters.setSearchInput}
        onChange={filters.update}
        onClear={filters.clearBarFilters}
      />

      <section
        aria-label="Lista de jogadores"
        className="flex min-h-0 flex-col rounded-xl border bg-background lg:min-h-56 lg:flex-1"
      >
        <PlayersToolbar
          scope={filters.draft.scope}
          sort={filters.draft.sort}
          onScopeChange={(scope) => filters.update({ scope })}
          onSortChange={(sort) => filters.update({ sort })}
        />

        <DataState
          isPending={players.isPending}
          error={players.error}
          isEmpty={players.isSuccess && list.length === 0}
          onRetry={() => void players.refetch()}
          loadingLabel="Carregando jogadores…"
          empty={
            filters.isFiltering ? (
              <>
                <p className="text-sm font-medium">Nenhum jogador encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Nenhum jogador atende a esses filtros.
                </p>
                <Button variant="outline" onClick={filters.reset}>
                  Limpar filtros
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Ainda não há jogadores</p>
                <p className="text-sm text-muted-foreground">
                  Cadastre o primeiro jogador para começar.
                </p>
                <Button onClick={() => setDialog({ type: 'create' })}>
                  <Plus aria-hidden="true" />
                  Novo jogador
                </Button>
              </>
            )
          }
        >
          <div
            className={`min-h-0 flex-1 transition-opacity ${players.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            <PlayersTable
              players={list}
              clubsById={clubsById}
              onSelect={(player) => setDialog({ type: 'details', player })}
              onBuy={(player) => setDialog({ type: 'buy', player })}
              onEdit={(player) => setDialog({ type: 'edit', player })}
              onChangeCondition={(player) => setDialog({ type: 'condition', player })}
              onDelete={(player) => setDialog({ type: 'delete', player })}
            />
          </div>

          {meta && (
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Mostrando {(meta.page - 1) * meta.limit + 1}–
                {(meta.page - 1) * meta.limit + list.length} de {meta.total_items}{' '}
                {meta.total_items === 1 ? 'jogador' : 'jogadores'}
              </p>
              <Pagination
                page={meta.page}
                totalPages={meta.total_pages}
                onChange={filters.setPage}
              />
            </footer>
          )}
        </DataState>
      </section>

      <p className="shrink-0 text-xs text-muted-foreground short:hidden">
        Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas,
        minúsculas e acentos.
      </p>

      {dialog?.type === 'create' && (
        <PlayerFormDialog
          onClose={close}
          onCreated={(player) => setDialog({ type: 'created', player })}
        />
      )}
      {dialog?.type === 'created' && (
        <PlayerCreatedDialog
          player={dialog.player}
          onClose={close}
          onViewDetails={() => setDialog({ type: 'details', player: dialog.player })}
        />
      )}
      {dialog?.type === 'details' && (
        <PlayerDetailsSheet
          player={dialog.player}
          clubName={clubNameOf(dialog.player)}
          onClose={close}
          onEdit={(player) => setDialog({ type: 'edit', player })}
          onChangeCondition={(player) => setDialog({ type: 'condition', player })}
          onBuy={(player) => setDialog({ type: 'buy', player })}
        />
      )}
      {dialog?.type === 'edit' && <PlayerFormDialog player={dialog.player} onClose={close} />}
      {dialog?.type === 'condition' && (
        <ConditionDialog
          player={dialog.player}
          clubName={clubNameOf(dialog.player)}
          onClose={close}
        />
      )}
      {dialog?.type === 'buy' && <BuyPlayerDialog player={dialog.player} onClose={close} />}
      {dialog?.type === 'delete' && (
        <DeletePlayerDialog player={dialog.player} onClose={close} onDeleted={handleDeleted} />
      )}
    </div>
  );
}

export default PlayersPage;
