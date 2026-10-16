import {
  BadgePercent,
  Check,
  Download,
  HandCoins,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataState } from '../../components/common/DataState';
import { FilterSelect } from '../../components/filters/FilterSelect';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useExportTransactions, useTransactions } from '../../hooks/market';
import { saveBlob } from '../../lib/download';
import { getErrorMessage } from '../../lib/errors';
import { formatDate, formatMoney, formatSignedMoney, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { TransactionType, TransactionsFilters } from '../../services/types';
import { avatarTone, initialsOf } from '../players/labels';

interface TransactionsPanelProps {
  clubId: number;
  acronym: string;
}

const TYPES: { value: TransactionType; label: string }[] = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'VENDA', label: 'Venda' },
];

const HEADERS = [
  { label: 'Data e hora', align: 'left' },
  { label: 'Tipo', align: 'left' },
  { label: 'Jogador', align: 'left' },
  { label: 'Valor', align: 'right' },
  { label: 'Taxa ou comissão', align: 'right' },
  { label: 'Multa', align: 'right' },
  { label: 'Lucro', align: 'right' },
  { label: 'Variação do caixa', align: 'right' },
] as const;

const ALIGN_CLASS = { left: 'text-left', right: 'text-right' } as const;

const CELL = 'px-3 py-3';

const sign = (value: number) =>
  value > 0 ? 'text-emerald-700' : value < 0 ? 'text-destructive' : '';

// Caixa de seleção em forma de botão: ligada, fica azul; o texto diz o que ela filtra.
function TypeChip(props: {
  label: string;
  checked: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const { label, checked, locked, onToggle } = props;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={locked || undefined}
      title={locked ? 'Pelo menos um tipo precisa ficar marcado.' : undefined}
      onClick={() => {
        if (!locked) onToggle();
      }}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        checked
          ? 'border-primary bg-primary/5 text-primary'
          : 'bg-background text-muted-foreground hover:text-foreground',
        locked && 'cursor-not-allowed',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-4 place-items-center rounded-[4px] border',
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function SummaryCell(props: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone?: string;
}) {
  const { icon: Icon, label, value, caption, tone } = props;

  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </p>
      <p className={cn('text-lg font-semibold tabular-nums', tone)}>{value}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

export function TransactionsPanel({ clubId, acronym }: TransactionsPanelProps) {
  const [types, setTypes] = useState<TransactionType[]>(['COMPRA', 'VENDA']);
  const [playerId, setPlayerId] = useState('');

  // Os dois tipos marcados é o mesmo que não filtrar, e o pedido sai sem o parâmetro.
  const filters: TransactionsFilters = {
    type: types.length === TYPES.length ? undefined : types,
    player_id: playerId ? Number(playerId) : undefined,
  };

  const transactions = useTransactions(clubId, filters);
  // Sem filtros: de onde saem os jogadores do seletor (a mesma consulta que conta as abas).
  const everything = useTransactions(clubId);
  const exporter = useExportTransactions();

  const list = transactions.data?.data ?? [];
  const summary = transactions.data?.summary;

  const playerOptions = [
    ...new Map(
      (everything.data?.data ?? []).map((item) => [item.player_id, item.player_name] as const),
    ),
  ]
    .map(([id, name]) => ({ value: String(id), label: name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

  function toggleType(type: TransactionType) {
    setTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  // O arquivo sai com os mesmos filtros da tela, gerado pela API.
  async function handleExport() {
    try {
      const file = await exporter.mutateAsync({ clubId, filters });
      saveBlob(file, `transacoes-${acronym.toLowerCase()}.csv`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-background lg:min-h-56">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 px-4 pt-4">
        <div>
          <h3 className="text-base font-semibold">Histórico de transações</h3>
          <p className="text-xs text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
          </p>
        </div>
        <Button variant="outline" disabled={exporter.isPending} onClick={() => void handleExport()}>
          <Download aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-4">
        <span className="text-sm text-muted-foreground">Tipo</span>
        {TYPES.map((type) => (
          <TypeChip
            key={type.value}
            label={type.label}
            checked={types.includes(type.value)}
            locked={types.length === 1 && types.includes(type.value)}
            onToggle={() => toggleType(type.value)}
          />
        ))}
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
        <FilterSelect
          label="Jogador"
          emptyText="Jogador: todos"
          icon={UserRound}
          clearLabel="Todos os jogadores"
          options={playerOptions}
          value={playerId}
          onValueChange={setPlayerId}
        />
      </div>

      <DataState
        isPending={transactions.isPending}
        error={transactions.error}
        isEmpty={transactions.isSuccess && list.length === 0}
        onRetry={() => void transactions.refetch()}
        loadingLabel="Carregando o histórico…"
        empty={
          <>
            <p className="text-sm font-medium">Nenhuma transação</p>
            <p className="text-sm text-muted-foreground">
              {types.length < TYPES.length || playerId
                ? 'Nenhuma transação com esses filtros.'
                : 'Compras e vendas do clube aparecem aqui.'}
            </p>
          </>
        }
      >
        <Table containerClassName="max-h-[28rem] min-h-0 flex-1 overflow-y-auto border-t lg:max-h-none">
          <TableHeader className="sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_var(--border)]">
            <TableRow>
              {HEADERS.map((header) => (
                <TableHead
                  key={header.label}
                  className={cn(
                    CELL,
                    'h-auto text-sm font-normal whitespace-normal text-muted-foreground',
                    ALIGN_CLASS[header.align],
                  )}
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((item) => {
              const isPurchase = item.type === 'COMPRA';

              return (
                <TableRow key={item.id}>
                  <TableCell className={cn(CELL, 'whitespace-nowrap tabular-nums')}>
                    {formatDate(item.created_at)}
                    <span className="ml-2 text-muted-foreground">
                      {formatTime(item.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className={CELL}>
                    <Badge variant={isPurchase ? 'outline' : 'secondary'} className="gap-1.5">
                      {isPurchase ? (
                        <ShoppingCart aria-hidden="true" className="size-3.5" />
                      ) : (
                        <HandCoins aria-hidden="true" className="size-3.5" />
                      )}
                      {isPurchase ? 'Compra' : 'Venda'}
                    </Badge>
                  </TableCell>
                  <TableCell className={CELL}>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-full text-xs font-medium',
                          avatarTone(item.player_name),
                        )}
                      >
                        {initialsOf(item.player_name)}
                      </span>
                      <span className="font-medium">{item.player_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {formatMoney(item.value)}
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {formatMoney(item.fee)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      CELL,
                      'text-right tabular-nums',
                      item.penalty === 0 && 'text-muted-foreground',
                    )}
                  >
                    {formatMoney(item.penalty)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      CELL,
                      'text-right tabular-nums',
                      item.profit === null ? 'text-muted-foreground' : sign(item.profit),
                    )}
                  >
                    {item.profit === null ? '–' : formatSignedMoney(item.profit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      CELL,
                      'text-right font-semibold tabular-nums',
                      sign(item.cash_change),
                    )}
                  >
                    {formatSignedMoney(item.cash_change)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataState>

      {summary && (
        <div className="grid shrink-0 grid-cols-2 divide-x border-t sm:grid-cols-5">
          <SummaryCell
            icon={ShoppingCart}
            label="Total pago em compras"
            value={formatMoney(summary.total_spent)}
            caption="Valor + taxa"
          />
          <SummaryCell
            icon={HandCoins}
            label="Total recebido em vendas"
            value={formatMoney(summary.total_received)}
            caption="Crédito líquido"
          />
          <SummaryCell
            icon={BadgePercent}
            label="Taxas e comissões"
            value={formatMoney(summary.total_fees)}
            caption="Somadas"
          />
          <SummaryCell
            icon={TriangleAlert}
            label="Multas"
            value={formatMoney(summary.total_penalties)}
            caption="Por fidelidade"
          />
          <SummaryCell
            icon={TrendingUp}
            label="Lucro total"
            value={formatSignedMoney(summary.total_profit)}
            caption="Soma dos lucros, com sinal"
            tone={sign(summary.total_profit)}
          />
        </div>
      )}
    </div>
  );
}
