import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  children: ReactNode;
}

// Um dado simples: rótulo pequeno em cima e o valor em destaque embaixo (use dentro de <dl>).
export function Stat({ label, children }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{children}</dd>
    </div>
  );
}
