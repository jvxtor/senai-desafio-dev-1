import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// Lista de dados em linhas, rótulo à esquerda e valor à direita (use FactRow dentro).
export function FactList({ children }: { children: ReactNode }) {
  return <dl className="divide-y rounded-xl border text-sm">{children}</dl>;
}

interface FactRowProps {
  label: string;
  /** Uma linha curta sob o rótulo, explicando de onde o valor vem. */
  hint?: string;
  /** Linha de destaque, como o total de uma conta. */
  strong?: boolean;
  children: ReactNode;
}

export function FactRow({ label, hint, strong, children }: FactRowProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 px-4 py-3', strong && 'bg-muted/40')}
    >
      <dt className={strong ? 'font-semibold' : 'text-muted-foreground'}>
        {label}
        {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
      </dt>
      <dd
        className={cn(
          'text-right tabular-nums',
          strong ? 'text-base font-semibold' : 'font-medium',
        )}
      >
        {children}
      </dd>
    </div>
  );
}
