import { CircleCheck, History } from 'lucide-react';
import { FactList, FactRow } from '../../components/common/FactRows';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { formatMoney, formatSignedMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { SaleResult } from '../../services/types';
import { MAX_PENALTY } from './labels';

interface SaleSummaryDialogProps {
  result: SaleResult;
  clubName: string;
  /** O jogador estava na escalação quando foi vendido. */
  wasStarter: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

const CONTRACT_STYLE = {
  RESCINDIDO: 'border-amber-200 bg-amber-50 text-amber-700',
  ENCERRADO: 'text-foreground',
} as const;

// O resultado da venda, conta por conta: o que entrou no caixa e por quê.
export function SaleSummaryDialog(props: SaleSummaryDialogProps) {
  const { result, clubName, wasStarter, onClose, onViewHistory } = props;
  const fulfilled = result.remaining_days === 0;

  const description =
    `${result.player_name} voltou a ficar livre${wasStarter ? ' e saiu da escalação' : ''}.` +
    (fulfilled ? ' A fidelidade já tinha terminado, então não houve multa.' : '');

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Venda concluída"
      description={description}
      icon={<CircleCheck className="size-5" />}
    >
      <FactList>
        <FactRow label="Valor de compra">{formatMoney(result.purchase_value)}</FactRow>
        <FactRow label="Valor de venda" hint="Valor de mercado no momento da venda">
          {formatMoney(result.value)}
        </FactRow>
        <FactRow label="Dias restantes">{result.remaining_days}</FactRow>
        <FactRow
          label="Multa"
          hint={
            fulfilled
              ? 'Fidelidade cumprida: sem multa'
              : `${result.penalty_rate}% do valor de venda, com teto de ${formatMoney(MAX_PENALTY)}`
          }
        >
          {formatMoney(result.penalty)}
        </FactRow>
        <FactRow label="Lucro">
          <span
            className={cn(
              (result.profit ?? 0) > 0 && 'text-emerald-700',
              (result.profit ?? 0) < 0 && 'text-destructive',
            )}
          >
            {formatSignedMoney(result.profit ?? 0)}
          </span>
        </FactRow>
        <FactRow
          label="Comissão"
          hint={
            (result.profit ?? 0) > 0
              ? '10% do lucro até 10,00 + 20% do que passar'
              : 'Sem lucro: sem comissão'
          }
        >
          {formatMoney(result.fee)}
        </FactRow>
        <FactRow strong label="Crédito no caixa" hint="Valor de venda – multa – comissão">
          {formatSignedMoney(result.cash_change)}
        </FactRow>
        <FactRow label="Contrato">
          <Badge variant="outline" className={CONTRACT_STYLE[result.contract_status]}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {result.contract_status}
          </Badge>
        </FactRow>
        <FactRow strong label={`Novo caixa do ${clubName}`}>
          {formatMoney(result.club_cash)}
        </FactRow>
      </FactList>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onViewHistory}>
          <History aria-hidden="true" />
          Ver histórico
        </Button>
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </Modal>
  );
}
