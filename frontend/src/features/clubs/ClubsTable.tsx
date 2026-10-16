import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Badge } from '../../components/ui/badge';
import { buttonVariants } from '../../components/ui/button';
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
  { label: 'Ações', align: 'right' },
] as const;

const ALIGN_CLASS = { left: 'text-left', right: 'text-right' } as const;

const CELL = 'px-3 py-2.5';

export function ClubsTable({ clubs }: ClubsTableProps) {
  const navigate = useNavigate();

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
              {header.label === 'Ações' ? <span className="sr-only">Ações</span> : header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.map((club) => (
          <TableRow
            key={club.id}
            className="cursor-pointer"
            onClick={(event) => {
              // O nome e o botão já são links; o resto da linha também leva ao clube.
              if (!(event.target as HTMLElement).closest('a, button')) {
                void navigate(`/clubes/${club.id}`);
              }
            }}
          >
            <TableCell className={CELL}>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/60 text-[0.7rem] font-medium"
                >
                  {club.acronym}
                </span>
                <Link
                  to={`/clubes/${club.id}`}
                  className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {club.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className={CELL}>
              <Badge variant="outline" className="rounded-md font-medium">
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
            <TableCell className={cn(CELL, 'text-right')}>
              <Link
                to={`/clubes/${club.id}`}
                aria-label={`Ver clube ${club.name}`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Ver clube
                <ChevronRight aria-hidden="true" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
