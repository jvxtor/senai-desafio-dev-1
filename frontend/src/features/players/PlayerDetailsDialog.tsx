import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { formatMoney } from '../../lib/format';
import type { Player } from '../../services/types';
import { AttributeBars } from './AttributeBars';
import { CONDITION_LABELS, POSITION_LABELS } from './labels';
import { PlayerStat } from './PlayerStat';

interface PlayerDetailsDialogProps {
  player: Player;
  /** Nome do clube, quando o jogador tem um. */
  clubName?: string;
  onClose: () => void;
}

export function PlayerDetailsDialog({ player, clubName, onClose }: PlayerDetailsDialogProps) {
  const club = player.club_id === null ? 'Jogador livre' : (clubName ?? `Clube ${player.club_id}`);

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={player.name}
      description={`${POSITION_LABELS[player.position]} · ${club}`}
    >
      <dl className="grid grid-cols-3 gap-4 rounded-xl border p-4">
        <PlayerStat label="Overall">{player.overall}</PlayerStat>
        <PlayerStat label="Idade">{player.age} anos</PlayerStat>
        <PlayerStat label="Agilidade">{player.agility}</PlayerStat>
        <PlayerStat label="Condição">{CONDITION_LABELS[player.condition]}</PlayerStat>
        <PlayerStat label="Valor base">{formatMoney(player.base_value)}</PlayerStat>
        <PlayerStat label="Valor de mercado">{formatMoney(player.market_value)}</PlayerStat>
      </dl>

      <section aria-label="Indicadores" className="flex flex-col gap-3 rounded-xl border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Indicadores</h3>
        <AttributeBars scores={player} potential={player.potential} />
        <p className="text-xs text-muted-foreground">
          Faixa clara: até o potencial ({player.potential}).
        </p>
      </section>

      <DialogFooter>
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </Modal>
  );
}
