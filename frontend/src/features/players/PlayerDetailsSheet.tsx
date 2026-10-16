import {
  ChartNoAxesColumn,
  Coins,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { FactList, FactRow } from '../../components/common/FactRows';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Player } from '../../services/types';
import { AttributeBars, MAX_ATTRIBUTE } from './AttributeBars';
import { CONDITION_LABELS, CONDITION_STYLE, initialsOf, POSITION_LABELS } from './labels';

interface PlayerDetailsSheetProps {
  player: Player;
  /** Nome do clube, quando o jogador tem um. */
  clubName?: string;
  onClose: () => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onBuy: (player: Player) => void;
}

function LegendItem({ swatch, children }: { swatch: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-sm', swatch)} />
      {children}
    </span>
  );
}

// Painel lateral com tudo sobre o jogador; abre ao clicar na linha da tabela.
export function PlayerDetailsSheet(props: PlayerDetailsSheetProps) {
  const { player, clubName, onClose, onEdit, onChangeCondition, onBuy } = props;
  const isFree = player.club_id === null;
  const club = isFree ? 'Livre' : (clubName ?? `Clube ${player.club_id}`);

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="flex-row items-center gap-3 p-4 pr-12">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-medium"
          >
            {initialsOf(player.name)}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <SheetTitle className="truncate text-lg">{player.name}</SheetTitle>
            <SheetDescription className="sr-only">
              Detalhes, indicadores e ações de {player.name}.
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="secondary"
                className="rounded-md"
                title={POSITION_LABELS[player.position]}
              >
                {player.position}
              </Badge>
              <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                {CONDITION_LABELS[player.condition]}
              </Badge>
              <Badge variant="outline" className="max-w-32 truncate text-muted-foreground">
                {club}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Valor de mercado"
              icon={Coins}
              value={formatMoney(player.market_value)}
              caption="Calculado automaticamente"
            />
            <MetricCard
              label="Valor base"
              icon={Tag}
              value={formatMoney(player.base_value)}
              caption="Calculado no cadastro"
            />
            <MetricCard
              label="Overall"
              icon={ChartNoAxesColumn}
              value={player.overall}
              caption="Calculado pela posição"
            />
            <MetricCard
              label="Potencial"
              icon={TrendingUp}
              value={player.potential}
              caption="Informado no cadastro"
            />
          </div>

          <section aria-label="Indicadores técnicos" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Indicadores técnicos</h3>
              <span className="text-xs text-muted-foreground">Escala de 1 a {MAX_ATTRIBUTE}</span>
            </div>
            <AttributeBars scores={player} potential={player.potential} />
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <LegendItem swatch="bg-primary">Valor do atributo</LegendItem>
              <LegendItem swatch="bg-primary/20">
                Até o potencial ({player.potential}), que nenhum atributo passa
              </LegendItem>
            </p>
          </section>

          <FactList>
            <FactRow label="Idade">{player.age} anos</FactRow>
            <FactRow label="Agilidade">{player.agility}</FactRow>
            <FactRow label="Clube">{club}</FactRow>
          </FactList>
        </div>

        <SheetFooter className="flex-row flex-wrap items-center gap-2 border-t">
          <Button type="button" variant="outline" onClick={() => onEdit(player)}>
            <Pencil aria-hidden="true" />
            Editar
          </Button>
          <Button type="button" variant="outline" onClick={() => onChangeCondition(player)}>
            <HeartPulse aria-hidden="true" />
            Alterar condição
          </Button>
          <Button
            type="button"
            className="ml-auto"
            disabled={!isFree}
            title={isFree ? undefined : 'Só jogadores livres podem ser comprados.'}
            onClick={() => onBuy(player)}
          >
            <ShoppingCart aria-hidden="true" />
            Comprar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
