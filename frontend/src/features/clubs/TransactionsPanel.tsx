import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Stat } from '../../components/common/Stat';
import { DataState } from '../../components/common/DataState';
import { SelectField } from '../../components/forms/fields';
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
import { formatDateTime, formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { TransactionType, TransactionsFilters } from '../../services/types';

interface TransactionsPanelProps {
  clubId: number;
  acronym: string;
}

const TYPE_OPTIONS = [
  { value: 'COMPRA', label: 'Só compras' },
  { value: 'VENDA', label: 'Só vendas' },
];

const HEADERS = [
  { label: 'Data', align: 'left' },
  { label: 'Jogador', align: 'left' },
  { label: 'Tipo', align: 'left' },
  { label: 'Valor', align: 'right' },
  { label: 'Taxa', align: 'right' },
  { label: 'Multa', align: 'right' },
  { label: 'Lucro', align: 'right' },
  { label: 'Variação do caixa', align: 'right' },
] as const;

const ALIGN_CLASS = { left: 'text-left', right: 'text-right' } as const;

const CELL = 'px-3 py-2.5';

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatMoney(value)}`;

export function TransactionsPanel({ clubId, acronym }: TransactionsPanelProps) {
  const [type, setType] = useState('');
  const filters: TransactionsFilters = type ? { type: [type as TransactionType] } : {};

  const transactions = useTransactions(clubId, filters);
  const exporter = useExportTransactions();

  const list = transactions.data?.data ?? [];
  const summary = transactions.data?.summary;

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
    <div className="flex flex-col gap-4">
      {summary && (
        <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-background p-4 sm:grid-cols-5">
          <Stat label="Total gasto">{formatMoney(summary.total_spent)}</Stat>
          <Stat label="Total recebido">{formatMoney(summary.total_received)}</Stat>
          <Stat label="Taxas">{formatMoney(summary.total_fees)}</Stat>
          <Stat label="Multas">{formatMoney(summary.total_penalties)}</Stat>
          <Stat label="Lucro">{formatMoney(summary.total_profit)}</Stat>
        </dl>
      )}

      <div className="rounded-xl border bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <SelectField
            label="Tipo de transação"
            hideLabel
            className="w-44"
            placeholder="Todas as transações"
            options={TYPE_OPTIONS}
            value={type}
            onValueChange={setType}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={exporter.isPending}
            onClick={() => void handleExport()}
          >
            <Download aria-hidden="true" />
            Exportar CSV
          </Button>
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
                {type
                  ? 'Este clube não tem transações desse tipo.'
                  : 'Compras e vendas do clube aparecem aqui.'}
              </p>
            </>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableHead
                    key={header.label}
                    className={cn(
                      CELL,
                      'h-auto text-xs whitespace-normal text-muted-foreground',
                      ALIGN_CLASS[header.align],
                    )}
                  >
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={cn(CELL, 'whitespace-nowrap tabular-nums')}>
                    {formatDateTime(item.created_at)}
                  </TableCell>
                  <TableCell className={cn(CELL, 'font-medium')}>{item.player_name}</TableCell>
                  <TableCell className={CELL}>
                    <Badge variant={item.type === 'COMPRA' ? 'secondary' : 'outline'}>
                      {item.type === 'COMPRA' ? 'Compra' : 'Venda'}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {formatMoney(item.value)}
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {formatMoney(item.fee)}
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {formatMoney(item.penalty)}
                  </TableCell>
                  <TableCell className={cn(CELL, 'text-right tabular-nums')}>
                    {item.profit === null ? '–' : formatMoney(item.profit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      CELL,
                      'text-right font-semibold tabular-nums',
                      item.cash_change < 0 ? 'text-destructive' : 'text-emerald-700',
                    )}
                  >
                    {signed(item.cash_change)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataState>
      </div>
    </div>
  );
}
