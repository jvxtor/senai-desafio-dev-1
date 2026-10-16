import { Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
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
import { formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Club, Condition, Player } from '../../services/types';
import { CONDITION_LABELS, POSITION_LABELS } from './labels';

interface PlayersTableProps {
  players: Player[];
  clubsById: Map<number, Club>;
  onBuy: (player: Player) => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onDelete: (player: Player) => void;
}

const CONDITION_STYLE: Record<Condition, string> = {
  APTO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MAL_CONDICIONADO: 'border-amber-200 bg-amber-50 text-amber-700',
  DOENTE: 'border-red-200 bg-red-50 text-red-700',
};

const HEADERS = [
  { label: 'Jogador', align: 'left' },
  { label: 'Posição', align: 'left' },
  { label: 'Overall', align: 'center' },
  { label: 'Agilidade', align: 'left' },
  { label: 'Idade', align: 'center' },
  { label: 'Condição', align: 'left' },
  { label: 'Valor base', align: 'right' },
  { label: 'Valor de mercado', align: 'right' },
  { label: 'Clube', align: 'left' },
] as const;

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const CELL = 'px-3 py-2.5';

function initialsOf(name: string): string {
  const words = name.split(' ').filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

// As faixas são as da regra da agilidade: de 80 para cima o desconto cai, até 30 ele sobe.
function agilityColor(agility: number): string {
  if (agility >= 80) return 'bg-emerald-600';
  if (agility <= 30) return 'bg-destructive';
  return 'bg-muted-foreground/50';
}

function AgilityMeter({ agility }: { agility: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 tabular-nums">{agility}</span>
      <span aria-hidden="true" className="h-1 w-9 overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full rounded-full ${agilityColor(agility)}`}
          style={{ width: `${agility}%` }}
        />
      </span>
    </div>
  );
}

function ClubCell({ player, clubsById }: Pick<PlayersTableProps, 'clubsById'> & { player: Player }) {
  if (player.club_id === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Livre
      </Badge>
    );
  }

  const club = clubsById.get(player.club_id);
  return (
    <span className="flex items-center gap-2">
      <Badge variant="secondary" className="rounded-md">
        {club?.acronym ?? '…'}
      </Badge>
      <span className="max-w-24 truncate" title={club?.name}>
        {club?.name ?? `Clube ${player.club_id}`}
      </span>
    </span>
  );
}

export function PlayersTable(props: PlayersTableProps) {
  const { players, clubsById, onBuy, onEdit, onChangeCondition, onDelete } = props;

  return (
    <Table>
      <TableHeader>
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
              {header.label}
            </TableHead>
          ))}
          <TableHead className={cn(CELL, 'h-auto')}>
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const isFree = player.club_id === null;
          const conditionLabel = CONDITION_LABELS[player.condition];

          return (
            <TableRow key={player.id}>
              <TableCell className={CELL}>
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[0.7rem] font-medium"
                  >
                    {initialsOf(player.name)}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
              </TableCell>
              <TableCell className={CELL}>
                <Badge
                  variant="secondary"
                  className="rounded-md"
                  title={POSITION_LABELS[player.position]}
                >
                  {player.position}
                </Badge>
              </TableCell>
              <TableCell className={cn(CELL, 'text-center font-semibold tabular-nums')}>
                {player.overall}
              </TableCell>
              <TableCell className={CELL}>
                <AgilityMeter agility={player.agility} />
              </TableCell>
              <TableCell className={cn(CELL, 'text-center tabular-nums')}>{player.age}</TableCell>
              <TableCell className={CELL}>
                {/* O próprio selo abre a troca de condição. */}
                <Badge
                  variant="outline"
                  render={<button type="button" />}
                  title="Alterar condição"
                  aria-label={`Alterar a condição de ${player.name} (atual: ${conditionLabel})`}
                  onClick={() => onChangeCondition(player)}
                  className={cn(
                    'cursor-pointer hover:ring-2 hover:ring-ring/30',
                    CONDITION_STYLE[player.condition],
                  )}
                >
                  {conditionLabel}
                </Badge>
              </TableCell>
              <TableCell className={cn(CELL, 'text-right text-muted-foreground tabular-nums')}>
                {formatMoney(player.base_value)}
              </TableCell>
              <TableCell className={cn(CELL, 'text-right font-semibold tabular-nums')}>
                {formatMoney(player.market_value)}
              </TableCell>
              <TableCell className={CELL}>
                <ClubCell player={player} clubsById={clubsById} />
              </TableCell>
              <TableCell className={CELL}>
                <div className="flex items-center justify-end gap-1">
                  {isFree && (
                    <Button variant="outline" size="sm" onClick={() => onBuy(player)}>
                      <ShoppingCart aria-hidden="true" />
                      Comprar
                    </Button>
                  )}
                  <IconButton
                    label="Editar"
                    ariaLabel={`Editar ${player.name}`}
                    onClick={() => onEdit(player)}
                  >
                    <Pencil aria-hidden="true" />
                  </IconButton>
                  {isFree && (
                    <IconButton
                      label="Excluir"
                      ariaLabel={`Excluir ${player.name}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(player)}
                    >
                      <Trash2 aria-hidden="true" />
                    </IconButton>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
