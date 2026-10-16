import { ChevronRight } from 'lucide-react';
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
import { formatDate, formatTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { MatchSide, MatchSummary } from '../../services/types';
import { RESULT_LABELS, RESULT_STYLE } from './labels';

interface MatchesTableProps {
  matches: MatchSummary[];
  onSelect: (match: MatchSummary) => void;
}

const HEADERS = [
  { label: 'Data e hora', align: 'left' },
  { label: 'Mandante', align: 'left' },
  { label: 'Placar', align: 'center' },
  { label: 'Visitante', align: 'left' },
  { label: 'Resultado', align: 'left' },
  { label: 'Ações', align: 'right' },
] as const;

const ALIGN_CLASS = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

const CELL = 'px-3 py-3';

function Team({ side, won }: { side: MatchSide; won: boolean }) {
  return (
    <div>
      <p className={cn('font-medium', !won && 'text-muted-foreground')}>{side.club_name}</p>
      <p className="text-xs text-muted-foreground">Formação {side.formation}</p>
    </div>
  );
}

export function MatchesTable({ matches, onSelect }: MatchesTableProps) {
  return (
    // O quadro é o único que rola; o cabeçalho fica fixo no topo dele.
    <Table containerClassName="max-h-[28rem] min-h-0 flex-1 overflow-y-auto lg:max-h-none">
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
        {matches.map((match) => (
          <TableRow
            key={match.id}
            className="cursor-pointer"
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest('button, a')) onSelect(match);
            }}
          >
            <TableCell className={cn(CELL, 'whitespace-nowrap tabular-nums')}>
              {formatDate(match.played_at)}
              <span className="ml-2 text-muted-foreground">{formatTime(match.played_at)}</span>
            </TableCell>
            <TableCell className={CELL}>
              <Team side={match.home} won={match.result !== 'VISITANTE'} />
            </TableCell>
            <TableCell className={cn(CELL, 'text-center text-base font-semibold tabular-nums')}>
              {match.home.goals} × {match.away.goals}
            </TableCell>
            <TableCell className={CELL}>
              <Team side={match.away} won={match.result !== 'MANDANTE'} />
            </TableCell>
            <TableCell className={CELL}>
              <Badge variant="outline" className={RESULT_STYLE[match.result]}>
                {RESULT_LABELS[match.result]}
              </Badge>
            </TableCell>
            <TableCell className={cn(CELL, 'text-right')}>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Ver detalhes da partida ${match.home.club_name} contra ${match.away.club_name}`}
                onClick={() => onSelect(match)}
              >
                Ver detalhes
                <ChevronRight aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
