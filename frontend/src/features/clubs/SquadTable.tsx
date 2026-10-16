import { HandCoins } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { formatDate, formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { SquadPlayer } from '../../services/types';
import {
  CONDITION_LABELS,
  CONDITION_STYLE,
  POSITION_LABELS,
  positionTone,
} from '../players/labels';
import { PlayerAvatar } from '../players/PlayerAvatar';

interface SquadTableProps {
  players: SquadPlayer[];
  onSelect: (player: SquadPlayer) => void;
  onSell: (player: SquadPlayer) => void;
}

const HEADERS = [
  { label: 'Jogador', align: 'left' },
  { label: 'Posição', align: 'left' },
  { label: 'Overall', align: 'center' },
  { label: 'Condição', align: 'left' },
  { label: 'Valor de mercado', align: 'right' },
  { label: 'Valor pago', align: 'right' },
  { label: 'Fidelidade até', align: 'left' },
  { label: 'Multa', align: 'right' },
  { label: 'Ações', align: 'right' },
] as const;

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const CELL = 'px-3 py-2.5';

export function SquadTable({ players, onSelect, onSell }: SquadTableProps) {
  return (
    <Table containerClassName="max-h-[28rem] min-h-0 flex-1 overflow-y-auto lg:max-h-none">
      <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
        <TableRow>
          {HEADERS.map((header) => (
            <TableHead
              key={header.label}
              className={cn(
                CELL,
                'h-auto text-xs whitespace-normal text-muted-foreground',
                ALIGN_CLASS[header.align],
              )}
            >
              {header.label === 'Ações' ? <span className="sr-only">Ações</span> : header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow
            key={player.id}
            className="cursor-pointer"
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest('button, a')) onSelect(player);
            }}
          >
            <TableCell className={CELL}>
              <div className="flex items-center gap-2.5">
                <PlayerAvatar name={player.name} position={player.position} size="sm" />
                <button
                  type="button"
                  className="rounded-sm text-left font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => onSelect(player)}
                >
                  {player.name}
                </button>
              </div>
            </TableCell>
            <TableCell className={CELL}>
              <Badge
                variant="secondary"
                className={cn('rounded-md', positionTone(player.position))}
                title={POSITION_LABELS[player.position]}
              >
                {player.position}
              </Badge>
            </TableCell>
            <TableCell className={cn(CELL, 'text-center font-semibold tabular-nums')}>
              {player.overall}
            </TableCell>
            <TableCell className={CELL}>
              <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
                {CONDITION_LABELS[player.condition]}
              </Badge>
            </TableCell>
            <TableCell className={cn(CELL, 'text-right font-semibold tabular-nums')}>
              {formatMoney(player.market_value)}
            </TableCell>
            <TableCell className={cn(CELL, 'text-right text-muted-foreground tabular-nums')}>
              {formatMoney(player.contract.purchase_value)}
            </TableCell>
            <TableCell className={CELL}>
              <span className="tabular-nums">{formatDate(player.contract.loyalty_until)}</span>
              <span className="block text-xs text-muted-foreground">
                {player.contract.remaining_days === 0
                  ? 'Fidelidade encerrada'
                  : `${player.contract.remaining_days} dias`}
              </span>
            </TableCell>
            <TableCell className={cn(CELL, 'text-right tabular-nums')}>
              {player.contract.penalty_rate}%
            </TableCell>
            <TableCell className={cn(CELL, 'text-right')}>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Vender ${player.name}`}
                onClick={() => onSell(player)}
              >
                <HandCoins aria-hidden="true" />
                Vender
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
