import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  icon: LucideIcon;
  value: string | number;
  /** Uma linha curta dizendo de onde o número vem. */
  caption: string;
}

// Um número em destaque, com rótulo, ícone e a explicação de onde ele vem.
export function MetricCard({ label, icon: Icon, value, caption }: MetricCardProps) {
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
