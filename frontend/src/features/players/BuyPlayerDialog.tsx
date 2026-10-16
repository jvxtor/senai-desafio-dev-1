import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '../../components/common/Modal';
import { DateTimeField } from '../../components/forms/DateTimeField';
import { FormError, SelectField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import { DialogFooter } from '../../components/ui/dialog';
import { useClubs } from '../../hooks/clubs';
import { useBuyPlayer } from '../../hooks/market';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, formatMoney } from '../../lib/format';
import { toApiDateTime } from '../../services/dates';
import type { Player, PurchaseResult } from '../../services/types';

interface BuyPlayerDialogProps {
  player: Player;
  onClose: () => void;
}

interface Errors {
  club?: string;
  loyalty?: string;
}

const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function BuyPlayerDialog({ player, onClose }: BuyPlayerDialogProps) {
  const clubs = useClubs();
  const buy = useBuyPlayer();

  const [clubId, setClubId] = useState('');
  const [loyalty, setLoyalty] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<PurchaseResult | null>(null);

  const clubOptions = (clubs.data ?? []).map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym}) · caixa ${formatMoney(club.cash)}`,
  }));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const next: Errors = {};
    if (!clubId) next.club = 'Escolha o clube comprador.';
    if (!DATE_TIME.test(loyalty)) next.loyalty = 'Informe a data e a hora do fim da fidelidade.';
    setErrors(next);
    if (next.club || next.loyalty) return;

    buy.mutate(
      {
        playerId: player.id,
        input: { club_id: Number(clubId), loyalty_until: toApiDateTime(loyalty) },
      },
      {
        onSuccess: (purchase) => {
          toast.success(`${purchase.player_name} foi comprado.`);
          setResult(purchase);
        },
      },
    );
  }

  if (result) return <PurchaseSummary result={result} onClose={onClose} />;

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`Comprar ${player.name}`}
      description={`Valor de mercado agora: ${formatMoney(player.market_value)}. A taxa e o limite de caixa são conferidos ao confirmar.`}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="Clube comprador"
          placeholder={clubs.isPending ? 'Carregando clubes…' : 'Escolha o clube'}
          options={clubOptions}
          value={clubId}
          error={errors.club}
          hint={
            clubs.isSuccess && clubOptions.length === 0
              ? 'Nenhum clube cadastrado ainda.'
              : undefined
          }
          onValueChange={(next) => {
            setClubId(next);
            setErrors((current) => ({ ...current, club: undefined }));
          }}
        />
        <DateTimeField
          label="Fim da fidelidade"
          hint="Horário de Brasília. Precisa ser no futuro e dentro de 3 anos."
          value={loyalty}
          error={errors.loyalty}
          onChange={(next) => {
            setLoyalty(next);
            setErrors((current) => ({ ...current, loyalty: undefined }));
          }}
        />

        {buy.error && <FormError message={getErrorMessage(buy.error)} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={buy.isPending}>
            Confirmar compra
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}

function PurchaseSummary({
  result,
  onClose,
}: {
  result: PurchaseResult;
  onClose: () => void;
}) {
  const rows: [string, string][] = [
    ['Valor', formatMoney(result.value)],
    ['Taxa', formatMoney(result.fee)],
    // Somar valor e taxa para mostrar o custo é permitido; a taxa em si vem da API.
    ['Custo total', formatMoney(result.value + result.fee)],
    ['Fim da fidelidade', formatDateTime(result.contract.loyalty_until)],
    ['Novo caixa do clube', formatMoney(result.club_cash)],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Compra concluída"
      description={`${result.player_name} agora está no elenco.`}
    >
      <dl className="divide-y rounded-xl border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <DialogFooter>
        <Button onClick={onClose}>Fechar</Button>
      </DialogFooter>
    </Modal>
  );
}
