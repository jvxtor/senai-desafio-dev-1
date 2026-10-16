import { CircleCheck, Shield, Swords, User, Users } from 'lucide-react';
import type { ReactNode } from 'react';

interface LeagueStatsProps {
  totalPlayers?: number;
  freePlayers?: number;
  totalClubs?: number;
  totalMatches?: number;
}

const UNAVAILABLE = '—';

function label(count: number | undefined, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function Stat({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className="[&_svg]:size-3.5">
        {icon}
      </span>
      {children}
    </li>
  );
}

function Count({ value }: { value?: number }) {
  return (
    <strong className="font-semibold text-foreground tabular-nums">{value ?? UNAVAILABLE}</strong>
  );
}

export function LeagueStats(props: LeagueStatsProps) {
  const { totalPlayers, freePlayers, totalClubs, totalMatches } = props;

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
      <Stat icon={<Users />}>
        <Count value={totalPlayers} />
        {label(totalPlayers, 'jogador', 'jogadores')}
      </Stat>
      <Stat icon={<User />}>
        <Count value={freePlayers} />
        {label(freePlayers, 'livre', 'livres')}
      </Stat>
      <Stat icon={<Shield />}>
        <Count value={totalClubs} />
        {label(totalClubs, 'clube', 'clubes')}
      </Stat>
      <Stat icon={<Swords />}>
        <Count value={totalMatches} />
        {label(totalMatches, 'partida', 'partidas')}
      </Stat>
      <Stat icon={<CircleCheck />}>Não precisa de login</Stat>
    </ul>
  );
}
