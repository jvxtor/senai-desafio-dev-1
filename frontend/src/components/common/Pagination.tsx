import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '../ui/pagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const MAX_VISIBLE = 7;

// Mostra todas as páginas quando são poucas; senão, a primeira, a última e a vizinhança da atual.
function getPageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, start + 3);
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return [
    1,
    ...(start > 2 ? (['gap'] as const) : []),
    ...middle,
    ...(end < totalPages - 1 ? (['gap'] as const) : []),
    totalPages,
  ];
}

// O PaginationLink do shadcn é um <a>; aqui trocar de página não muda a URL, então os controles são botões.
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <PaginationRoot className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            Anterior
          </Button>
        </PaginationItem>

        {getPageItems(page, totalPages).map((item, index) => (
          <PaginationItem key={item === 'gap' ? `gap-${index}` : item}>
            {item === 'gap' ? (
              <PaginationEllipsis />
            ) : (
              <Button
                variant={item === page ? 'default' : 'ghost'}
                size="sm"
                aria-label={`Página ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className="min-w-7 tabular-nums"
                onClick={() => onChange(item)}
              >
                {item}
              </Button>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onChange(page + 1)}
          >
            Próxima
            <ChevronRight aria-hidden="true" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
