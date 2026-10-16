interface LeagueStatusProps {
  leader?: { name: string; points: number };
}

export function LeagueStatus({ leader }: LeagueStatusProps) {
  return (
    <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 rounded-full border bg-background px-3 py-1 text-xs">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-600" />
      <span className="font-medium">Liga Fictícia 2026</span>
      {leader && (
        <>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">
            líder: {leader.name}, {leader.points} pontos
          </span>
        </>
      )}
    </p>
  );
}
