import type { ReactNode } from 'react';

interface PlayerStatProps {
  label: string;
  children: ReactNode;
}

// Um dado do jogador: rótulo pequeno em cima e o valor em destaque embaixo.
export function PlayerStat({ label, children }: PlayerStatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{children}</dd>
    </div>
  );
}
