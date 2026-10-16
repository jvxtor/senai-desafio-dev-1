import { Eye, HeartPulse, MoreHorizontal, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import type { Player } from '../../services/types';

interface PlayerActionsMenuProps {
  player: Player;
  onViewDetails: (player: Player) => void;
  onEdit: (player: Player) => void;
  onChangeCondition: (player: Player) => void;
  onBuy: (player: Player) => void;
  onDelete: (player: Player) => void;
}

// Todas as ações de uma linha. Comprar e excluir só valem para jogador livre.
export function PlayerActionsMenu(props: PlayerActionsMenuProps) {
  const { player, onViewDetails, onEdit, onChangeCondition, onBuy, onDelete } = props;
  const isFree = player.club_id === null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`Ações de ${player.name}`} />}
      >
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewDetails(player)}>
            <Eye aria-hidden="true" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(player)}>
            <Pencil aria-hidden="true" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeCondition(player)}>
            <HeartPulse aria-hidden="true" />
            Alterar condição
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!isFree} onClick={() => onBuy(player)}>
            <ShoppingCart aria-hidden="true" />
            Comprar
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={!isFree} onClick={() => onDelete(player)}>
          <Trash2 aria-hidden="true" />
          Excluir
        </DropdownMenuItem>
        <p className="px-1.5 pt-1 pb-1.5 text-xs text-muted-foreground">
          {isFree
            ? 'Disponível porque o jogador está livre.'
            : 'Comprar e excluir só valem para jogadores livres.'}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
