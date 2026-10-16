import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { FormError, SelectField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useChangePlayerCondition } from '../../hooks/players';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney } from '../../lib/format';
import type { Condition, Player } from '../../services/types';
import { CONDITION_LABELS, CONDITION_OPTIONS } from './labels';

interface ConditionDialogProps {
  player: Player;
  onClose: () => void;
}

export function ConditionDialog({ player, onClose }: ConditionDialogProps) {
  const change = useChangePlayerCondition();
  const [condition, setCondition] = useState<Condition>(player.condition);

  const isSick = player.condition === 'DOENTE';
  // Um jogador doente não volta direto para apto: a tela já impede o que a API recusaria.
  const options = CONDITION_OPTIONS.map((option) => ({
    ...option,
    disabled: isSick && option.value === 'APTO',
  }));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    change.mutate(
      { id: player.id, condition },
      {
        onSuccess: (updated) => {
          toast.success(
            `${updated.name} agora está ${CONDITION_LABELS[updated.condition].toLowerCase()}. Valor de mercado: ${formatMoney(updated.market_value)}.`,
          );
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Alterar condição"
      description={`${player.name} está ${CONDITION_LABELS[player.condition].toLowerCase()}. A condição muda o valor de mercado.`}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="Nova condição"
          options={options}
          value={condition}
          hint={
            isSick
              ? 'Um jogador doente passa por mal condicionado antes de voltar a apto.'
              : undefined
          }
          onValueChange={(next) => setCondition(next as Condition)}
        />

        {change.error && <FormError message={getErrorMessage(change.error)} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={change.isPending}>
            Alterar condição
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
