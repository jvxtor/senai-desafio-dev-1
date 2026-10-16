import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  value: string | number;
  /** Uma linha curta dizendo de onde o número vem. */
  caption: string;
  /** Versão pequena, para o cabeçalho: sem a legenda na tela (ela vira dica). */
  compact?: boolean;
}

// Um número em destaque, com rótulo, ícone e a explicação de onde ele vem.
export function MetricCard({ label, icon: Icon, value, caption, compact }: MetricCardProps) {
  if (compact) {
    return (
      <div
        title={caption}
        className="flex min-w-0 flex-col gap-0.5 rounded-xl border bg-background px-3 py-2 lg:min-w-36"
      >
        <div className="flex items-center gap-1.5 text-xs leading-tight text-muted-foreground">
          <Icon aria-hidden="true" className="size-3.5 shrink-0" />
          {label}
        </div>
        <p className="text-base font-semibold tabular-nums">{value}</p>
        <span className="sr-only">{caption}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-background p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {label}
        <Icon aria-hidden="true" className="size-3.5" />
      </div>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
