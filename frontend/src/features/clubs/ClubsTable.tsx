import { Shield } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { formatMoney } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Club } from '../../services/types';

interface ClubsTableProps {
  clubs: Club[];
}

const HEADERS = [
  { label: 'Clube', align: 'left' },
  { label: 'Sigla', align: 'left' },
  { label: 'Caixa', align: 'right' },
  { label: 'Valor do elenco', align: 'right' },
  { label: 'Patrimônio', align: 'right' },
] as const;

const ALIGN_CLASS = { left: 'text-left', right: 'text-right' } as const;

const CELL = 'px-3 py-2.5';

export function ClubsTable({ clubs }: ClubsTableProps) {
  return (
    // O quadro é o único que rola; o cabeçalho fica fixo no topo dele.
    <Table containerClassName="h-full max-h-[28rem] overflow-y-auto lg:max-h-none">
      <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
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
        {clubs.map((club) => (
          <TableRow key={club.id}>
            <TableCell className={CELL}>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                >
                  <Shield className="size-4" />
                </span>
                <span className="font-medium">{club.name}</span>
              </div>
            </TableCell>
            <TableCell className={CELL}>
              <Badge variant="secondary" className="rounded-md">
                {club.acronym}
              </Badge>
            </TableCell>
            <TableCell className={cn(CELL, 'text-right tabular-nums')}>
              {formatMoney(club.cash)}
            </TableCell>
            <TableCell className={cn(CELL, 'text-right text-muted-foreground tabular-nums')}>
              {formatMoney(club.squad_value)}
            </TableCell>
            <TableCell className={cn(CELL, 'text-right font-semibold tabular-nums')}>
              {formatMoney(club.net_worth)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
