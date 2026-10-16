import { Landmark, Shield, ShoppingCart, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { DataState } from '../components/common/DataState';
import { MetricCard } from '../components/common/MetricCard';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BuyPlayersDialog } from '../features/clubs/BuyPlayersDialog';
import { LineupDialog } from '../features/clubs/LineupDialog';
import { LineupPanel } from '../features/clubs/LineupPanel';
import { SellPlayerDialog } from '../features/clubs/SellPlayerDialog';
import { SquadTable } from '../features/clubs/SquadTable';
import { TransactionsPanel } from '../features/clubs/TransactionsPanel';
import { BuyPlayerDialog } from '../features/players/BuyPlayerDialog';
import { ConditionDialog } from '../features/players/ConditionDialog';
import { PlayerDetailsSheet } from '../features/players/PlayerDetailsSheet';
import { PlayerFormDialog } from '../features/players/PlayerFormDialog';
import { useClub } from '../hooks/clubs';
import { useLineup } from '../hooks/lineup';
import { formatMoney } from '../lib/format';
import type { Player, SquadPlayer } from '../services/types';

type DialogState =
  | { type: 'buyList' | 'lineup' }
  | { type: 'buy' | 'sheet' | 'edit' | 'condition'; player: Player }
  | { type: 'sell'; player: SquadPlayer }
  | null;

function ClubPage() {
  const clubId = Number(useParams().id);
  const club = useClub(clubId);
  const lineup = useLineup(clubId);
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
              action={
                <Button onClick={() => setDialog({ type: 'buyList' })}>
                  <ShoppingCart aria-hidden="true" />
                  Comprar jogadores
                </Button>
              }
            />

            <div className="grid shrink-0 gap-3 sm:grid-cols-3">
              <MetricCard
                label="Caixa"
                icon={Wallet}
                value={formatMoney(club.data.cash)}
                caption="Só muda por compras e vendas"
              />
              <MetricCard
                label="Valor do elenco"
                icon={Users}
                value={formatMoney(club.data.squad_value)}
                caption="Soma do valor de mercado dos jogadores"
              />
              <MetricCard
                label="Patrimônio"
                icon={Landmark}
                value={formatMoney(club.data.net_worth)}
                caption="Caixa mais valor do elenco"
              />
            </div>

            <Tabs
              value={tab}
              onValueChange={(next) => setTab(String(next))}
              className="min-h-0 flex-1"
            >
              <TabsList aria-label="Seções do clube">
                <TabsTrigger value="squad" className="px-3">
                  Elenco ({squad.length})
                </TabsTrigger>
                <TabsTrigger value="lineup" className="px-3">
                  Escalação
                </TabsTrigger>
                <TabsTrigger value="history" className="px-3">
                  Histórico
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
                      <Button onClick={() => setDialog({ type: 'buyList' })}>
                        <ShoppingCart aria-hidden="true" />
                        Comprar jogadores
                      </Button>
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
                  lineup={lineup.data}
                  isPending={lineup.isPending}
                  error={lineup.error}
                  onRetry={() => void lineup.refetch()}
                  onEdit={() => setDialog({ type: 'lineup' })}
                />
              </TabsContent>

              <TabsContent value="history" className="flex min-h-0 flex-1 flex-col">
                <TransactionsPanel clubId={club.data.id} acronym={club.data.acronym} />
              </TabsContent>
            </Tabs>

            {dialog?.type === 'buyList' && (
              <BuyPlayersDialog
                clubName={club.data.name}
                clubCash={club.data.cash}
                onBuy={(player) => setDialog({ type: 'buy', player })}
                onClose={close}
              />
            )}
            {dialog?.type === 'buy' && (
              <BuyPlayerDialog player={dialog.player} clubId={club.data.id} onClose={close} />
            )}
            {dialog?.type === 'lineup' && (
              <LineupDialog
                clubId={club.data.id}
                squad={squad}
                lineup={lineup.data}
                onClose={close}
              />
            )}
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
