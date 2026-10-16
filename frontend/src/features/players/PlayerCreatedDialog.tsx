import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { formatMoney } from '../../lib/format';
import type { Player } from '../../services/types';
import { POSITION_LABELS } from './labels';
import { PlayerStat } from './PlayerStat';

interface PlayerCreatedDialogProps {
  player: Player;
  onClose: () => void;
  onViewDetails: () => void;
}

// Confirmação depois do cadastro: mostra o que a API calculou e deixa seguir para os detalhes.
export function PlayerCreatedDialog({ player, onClose, onViewDetails }: PlayerCreatedDialogProps) {
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Jogador cadastrado"
      description={`${player.name} entrou na lista como jogador livre.`}
    >
      <dl className="grid grid-cols-3 gap-4 rounded-xl border p-4">
        <PlayerStat label="Posição">{POSITION_LABELS[player.position]}</PlayerStat>
        <PlayerStat label="Overall">{player.overall}</PlayerStat>
        <PlayerStat label="Valor base">{formatMoney(player.base_value)}</PlayerStat>
      </dl>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button type="button" onClick={onViewDetails}>
          Ver detalhes
        </Button>
      </DialogFooter>
    </Modal>
  );
}
