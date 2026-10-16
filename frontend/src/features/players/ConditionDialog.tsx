import { TriangleAlert } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { FormError } from '../../components/forms/fields';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { useLineup } from '../../hooks/lineup';
import { useChangePlayerCondition } from '../../hooks/players';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Condition, Player } from '../../services/types';
import {
  CONDITION_DESCRIPTIONS,
  CONDITION_LABELS,
  CONDITION_STYLE,
  initialsOf,
  POSITION_LABELS,
} from './labels';

interface ConditionDialogProps {
  player: Player;
  /** Nome do clube, quando o jogador tem um. */
  clubName?: string;
  onClose: () => void;
}

const CONDITIONS: Condition[] = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'];
// Um clube só joga partidas com os 5 titulares escalados.
const LINEUP_SIZE = 5;

export function ConditionDialog({ player, clubName, onClose }: ConditionDialogProps) {
  const change = useChangePlayerCondition();
  const lineup = useLineup(player.club_id);
  const [condition, setCondition] = useState<Condition>(player.condition);

  const isSick = player.condition === 'DOENTE';
  // Se a escalação não carregar, o aviso não aparece, mas a API continua aplicando a regra.
  const isStarter = lineup.data?.players.some((starter) => starter.id === player.id) ?? false;
  const leavesLineup = isStarter && condition === 'DOENTE' && !isSick;

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
      size="md"
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-medium"
          >
            {initialsOf(player.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{player.name}</p>
            <p className="text-xs text-muted-foreground">
              {player.position} · {POSITION_LABELS[player.position]} · {player.age} anos
            </p>
          </div>
          <Badge variant="outline" className={CONDITION_STYLE[player.condition]}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {CONDITION_LABELS[player.condition]}
          </Badge>
        </div>

        <RadioGroup
          aria-label="Nova condição"
          value={condition}
          onValueChange={(next) => setCondition(next as Condition)}
        >
          {CONDITIONS.map((option) => {
            // Um jogador doente não volta direto para apto: a tela já impede o que a API recusaria.
            const blocked = isSick && option === 'APTO';

            return (
              <label
                key={option}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40',
                  'has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5',
                  blocked && 'cursor-not-allowed opacity-60 hover:bg-transparent',
                )}
              >
                <RadioGroupItem value={option} disabled={blocked} className="mt-0.5" />
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {CONDITION_LABELS[option]}
                    {option === player.condition && (
                      <Badge variant="secondary" className="font-normal">
                        Atual
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CONDITION_DESCRIPTIONS[option]}
                  </span>
                </span>
              </label>
            );
          })}
        </RadioGroup>

        {isSick && (
          <p className="text-xs text-muted-foreground">
            Um jogador doente passa por mal condicionado antes de voltar a apto.
          </p>
        )}

        {leavesLineup && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>{player.name} é titular</AlertTitle>
            <AlertDescription className="text-amber-800">
              Ao passar a Doente, ele sai da escalação, e o {clubName ?? 'clube'} só volta a jogar
              partidas depois de escalar de novo os {LINEUP_SIZE} titulares.
            </AlertDescription>
          </Alert>
        )}

        {change.error && <FormError message={getErrorMessage(change.error)} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={change.isPending || condition === player.condition}>
            Salvar condição
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
