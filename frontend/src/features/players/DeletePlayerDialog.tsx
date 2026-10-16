import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDeletePlayer } from '../../hooks/players';
import { getErrorMessage } from '../../lib/errors';
import type { Player } from '../../services/types';

interface DeletePlayerDialogProps {
  player: Player;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeletePlayerDialog({
  player,
  onClose,
  onDeleted,
}: DeletePlayerDialogProps) {
  const remove = useDeletePlayer();

  function handleConfirm() {
    remove.mutate(player.id, {
      onSuccess: () => {
        toast.success(`${player.name} foi excluído.`);
        onDeleted();
        onClose();
      },
    });
  }

  return (
    <ConfirmDialog
      open
      destructive
      title={`Excluir ${player.name}?`}
      description="O jogador sai da lista. Só jogadores livres podem ser excluídos."
      confirmLabel="Excluir jogador"
      pending={remove.isPending}
      error={remove.error ? getErrorMessage(remove.error) : null}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
