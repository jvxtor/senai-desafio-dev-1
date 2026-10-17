import {
  ClipboardList,
  History,
  Landmark,
  Shield,
  Shirt,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { DataState } from '../components/common/DataState';
import { MetricCard } from '../components/common/MetricCard';
import { PageHeader } from '../components/common/PageHeader';
import { buttonVariants } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MAX_SQUAD_SIZE } from '../features/clubs/labels';
import { LineupPanel } from '../features/clubs/LineupPanel';
import { SellPlayerDialog } from '../features/clubs/SellPlayerDialog';
import { SquadTable } from '../features/clubs/SquadTable';
import { TransactionsPanel } from '../features/clubs/TransactionsPanel';
import { ConditionDialog } from '../features/players/ConditionDialog';
import { PlayerDetailsSheet } from '../features/players/PlayerDetailsSheet';
import { PlayerFormDialog } from '../features/players/PlayerFormDialog';
import { FREE_PLAYERS_URL } from '../features/players/filters';
import { useClub } from '../hooks/clubs';
import { useLineup } from '../hooks/lineup';
import { useTransactions } from '../hooks/market';
import { formatMoney } from '../lib/format';
import type { Player, SquadPlayer } from '../services/types';

type DialogState =
  | { type: 'sheet' | 'edit' | 'condition'; player: Player }
  | { type: 'sell'; player: SquadPlayer }
  | null;

// Abas em linha: ícone, nome e contador; a ativa ganha o sublinhado azul e o contador azulado.
const TAB_CLASS =
  'flex-none gap-2 px-1 group-data-horizontal/tabs:after:-bottom-px after:bg-primary ' +
  'data-active:[&_[data-slot=tab-count]]:bg-primary/10 data-active:[&_[data-slot=tab-count]]:text-primary';

function TabLabel({
  icon: Icon,
  count,
  children,
}: {
  icon: typeof Shirt;
  count?: number;
  children: ReactNode;
}) {
  return (
    <>
      <Icon aria-hidden="true" className="size-4" />
      {children}
      {count !== undefined && (
        <span
          data-slot="tab-count"
          className="rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums"
        >
          {count}
        </span>
      )}
    </>
  );
}

function ClubPage() {
  const clubId = Number(useParams().id);
  const club = useClub(clubId);
  const lineup = useLineup(clubId);
  // Sem filtros: é a mesma consulta que o histórico usa, então só conta uma vez.
  const history = useTransactions(clubId);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [tab, setTab] = useState('squad');
  const close = () => setDialog(null);

  const squad = club.data?.players ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 short:gap-3 lg:h-full">
      <DataState
        isPending={club.isPending}
        error={club.error}
        isEmpty={false}
        onRetry={() => void club.refetch()}
        loadingLabel="Carregando o clube…"
        empty={null}
      >
        {club.data && (
          <>
            <PageHeader
              icon={Shield}
              title={club.data.name}
              description={`Sigla ${club.data.acronym} · ${squad.length} ${squad.length === 1 ? 'jogador' : 'jogadores'} no elenco`}
              aside={
                <div className="grid grid-cols-3 gap-2 lg:flex">
                  {/* Só em telas largas (1280px ou mais): abaixo disso o cabeçalho quebraria em duas linhas, e o contador do elenco já aparece na aba. */}
                  <div className="hidden xl:block">
                    <MetricCard
                      label="Elenco"
                      icon={Shirt}
                      value={`${squad.length} de ${MAX_SQUAD_SIZE}`}
                      caption="Jogadores no elenco, de no máximo 12"
                      compact
                    />
                  </div>
                  <MetricCard
                    label="Caixa"
                    icon={Wallet}
                    value={formatMoney(club.data.cash)}
                    caption="Só muda por compras e vendas"
                    compact
                  />
                  <MetricCard
                    label="Valor do elenco"
                    icon={Users}
                    value={formatMoney(club.data.squad_value)}
                    caption="Soma do valor de mercado dos jogadores"
                    compact
                  />
                  <MetricCard
                    label="Patrimônio"
                    icon={Landmark}
                    value={formatMoney(club.data.net_worth)}
                    caption="Caixa mais valor do elenco"
                    compact
                  />
                </div>
              }
              action={
                <Link to={FREE_PLAYERS_URL} className={buttonVariants()}>
                  <ShoppingCart aria-hidden="true" />
                  Comprar jogadores
                </Link>
              }
            />

            <Tabs
              value={tab}
              onValueChange={(next) => setTab(String(next))}
              className="min-h-0 flex-1"
            >
              <TabsList
                variant="line"
                aria-label="Seções do clube"
                className="h-10 w-full justify-start gap-4 overflow-x-auto overflow-y-hidden border-b p-0 sm:gap-6"
              >
                <TabsTrigger value="squad" className={TAB_CLASS}>
                  <TabLabel icon={Shirt} count={squad.length}>
                    Elenco
                  </TabLabel>
                </TabsTrigger>
                <TabsTrigger value="lineup" className={TAB_CLASS}>
                  <TabLabel icon={ClipboardList}>Escalação</TabLabel>
                </TabsTrigger>
                <TabsTrigger value="history" className={TAB_CLASS}>
                  <TabLabel icon={History} count={history.data?.data.length}>
                    Histórico
                  </TabLabel>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="squad" className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-background lg:min-h-56">
                  {squad.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                      <p className="text-sm font-medium">Este clube ainda não tem jogadores</p>
                      <p className="text-sm text-muted-foreground">
                        Compre jogadores livres para montar o elenco.
                      </p>
                      <Link to={FREE_PLAYERS_URL} className={buttonVariants()}>
                        <ShoppingCart aria-hidden="true" />
                        Comprar jogadores
                      </Link>
                    </div>
                  ) : (
                    <SquadTable
                      players={squad}
                      onSelect={(player) => setDialog({ type: 'sheet', player })}
                      onSell={(player) => setDialog({ type: 'sell', player })}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lineup" className="flex min-h-0 flex-1 flex-col">
                <LineupPanel
                  clubId={club.data.id}
                  squad={squad}
                  lineup={lineup.data}
                  isPending={lineup.isPending}
                  error={lineup.error}
                  onRetry={() => void lineup.refetch()}
                />
              </TabsContent>

              <TabsContent value="history" className="flex min-h-0 flex-1 flex-col">
                <TransactionsPanel clubId={club.data.id} acronym={club.data.acronym} />
              </TabsContent>
            </Tabs>

            {dialog?.type === 'sheet' && (
              <PlayerDetailsSheet
                player={dialog.player}
                clubName={club.data.name}
                onClose={close}
                onEdit={(player) => setDialog({ type: 'edit', player })}
                onChangeCondition={(player) => setDialog({ type: 'condition', player })}
                onBuy={close}
              />
            )}
            {dialog?.type === 'sell' && (
              <SellPlayerDialog
                player={dialog.player}
                clubName={club.data.name}
                isStarter={
                  lineup.data?.players.some((starter) => starter.id === dialog.player.id) ?? false
                }
                onClose={close}
                onViewHistory={() => {
                  setTab('history');
                  close();
                }}
              />
            )}
            {dialog?.type === 'edit' && <PlayerFormDialog player={dialog.player} onClose={close} />}
            {dialog?.type === 'condition' && (
              <ConditionDialog player={dialog.player} clubName={club.data.name} onClose={close} />
            )}
          </>
        )}
      </DataState>
    </div>
  );
}

export default ClubPage;
