import { Badge } from '../../components/ui/badge';
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
import type { Club, Player } from '../../services/types';
import { CONDITION_LABELS, CONDITION_STYLE, POSITION_LABELS, positionTone } from './labels';
import { PlayerActionsMenu } from './PlayerActionsMenu';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayersTableProps {
  players: Player[];
  clubsById: Map<number, Club>;
  onSelect: (player: Player) => void;
  onBuy: (player: Player) => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onDelete: (player: Player) => void;
}

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

function ClubCell({
  player,
  clubsById,
}: Pick<PlayersTableProps, 'clubsById'> & { player: Player }) {
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
  const { players, clubsById, onSelect, onBuy, onEdit, onChangeCondition, onDelete } = props;

  return (
    // O quadro é o único que rola (nos dois eixos); o cabeçalho fica fixo no topo dele.
    <Table containerClassName="h-full max-h-[28rem] overflow-y-auto lg:max-h-none">
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
          const conditionLabel = CONDITION_LABELS[player.condition];

          return (
            <TableRow
              key={player.id}
              className="cursor-pointer"
              onClick={(event) => {
                // Botões, o selo da condição e o menu de ações têm a própria ação.
                const target = event.target as HTMLElement;
                if (!target.closest('button, a, [role="menu"], [role="menuitem"]'))
                  onSelect(player);
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
                <div className="flex justify-end">
                  <PlayerActionsMenu
                    player={player}
                    onEdit={onEdit}
                    onChangeCondition={onChangeCondition}
                    onBuy={onBuy}
                    onDelete={onDelete}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
