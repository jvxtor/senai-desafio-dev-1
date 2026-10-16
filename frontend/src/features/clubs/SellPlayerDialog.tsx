import { CircleAlert, HandCoins, Info, Loader2, TriangleAlert } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FactList, FactRow } from '../../components/common/FactRows';
import { Modal } from '../../components/common/Modal';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useSellPlayer } from '../../hooks/market';
import { getErrorMessage } from '../../lib/errors';
import { formatDateAndTime, formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { SaleResult, SquadPlayer } from '../../services/types';
import { initialsOf, POSITION_LABELS } from '../players/labels';
import { MAX_PENALTY } from './labels';
import { SaleSummaryDialog } from './SaleSummaryDialog';

interface SellPlayerDialogProps {
  player: SquadPlayer;
  clubName: string;
  /** O jogador está na escalação: vender tira ele de lá. */
  isStarter: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

// Um clube só joga partidas com os 5 titulares escalados.
const LINEUP_SIZE = 5;

export function SellPlayerDialog(props: SellPlayerDialogProps) {
  const { player, clubName, isStarter, onClose, onViewHistory } = props;
  const sell = useSellPlayer();
  // Depois da venda a escalação é atualizada; por isso guardo se ele era titular na hora de confirmar.
  const [result, setResult] = useState<{ sale: SaleResult; wasStarter: boolean } | null>(null);

  const { contract } = player;
  const error = sell.error ? getErrorMessage(sell.error) : null;

  // Enquanto o pedido está no ar, o diálogo não fecha: a resposta ainda vai chegar.
  const close = () => {
    if (!sell.isPending) onClose();
  };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const wasStarter = isStarter;
    sell.mutate(player.id, {
      onSuccess: (sale) => {
        toast.success(`${sale.player_name} foi vendido.`);
        setResult({ sale, wasStarter });
      },
    });
  }

  if (result) {
    return (
      <SaleSummaryDialog
        result={result.sale}
        clubName={clubName}
        wasStarter={result.wasStarter}
        onClose={onClose}
        onViewHistory={onViewHistory}
      />
    );
  }

  return (
    <Modal
      open
      onClose={close}
      size="md"
      title={`Vender ${player.name}?`}
      description={`O jogador sai do elenco do ${clubName} e volta a ficar livre.`}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>A venda foi recusada</AlertTitle>
            <AlertDescription className="text-destructive/90">{error}</AlertDescription>
          </Alert>
        )}

        {isStarter && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>{player.name} é titular</AlertTitle>
            <AlertDescription className="text-amber-800">
              Ao vender, ele sai da escalação, e o {clubName} só volta a jogar partidas depois de
              escalar de novo os {LINEUP_SIZE} titulares.
            </AlertDescription>
          </Alert>
        )}

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
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Valor de mercado</p>
            <p className="text-lg font-semibold tabular-nums">{formatMoney(player.market_value)}</p>
          </div>
        </div>

        <FactList>
          <FactRow label="Valor de compra">{formatMoney(contract.purchase_value)}</FactRow>
          <FactRow label="Fim da fidelidade">{formatDateAndTime(contract.loyalty_until)}</FactRow>
          <FactRow label="Dias restantes">{contract.remaining_days}</FactRow>
          <FactRow label="% de multa se vender agora">
            <Badge
              variant="outline"
              className={cn(
                contract.penalty_rate > 0 && 'border-amber-200 bg-amber-50 text-amber-700',
              )}
            >
              {contract.penalty_rate}%
            </Badge>
          </FactRow>
        </FactList>

        <p className="flex items-start gap-2 rounded-xl border bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            A venda é pelo valor de mercado do momento. Multa (teto de {formatMoney(MAX_PENALTY)}),
            lucro, comissão e crédito são calculados ao confirmar.
          </span>
        </p>

        {sell.isPending && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border bg-muted/40 px-3 py-3 text-xs text-muted-foreground"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Enviando a venda. Os botões ficam desabilitados até a resposta.
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={sell.isPending} onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={sell.isPending}>
            {sell.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" />
                Vendendo…
              </>
            ) : (
              <>
                <HandCoins aria-hidden="true" />
                Confirmar venda
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}
