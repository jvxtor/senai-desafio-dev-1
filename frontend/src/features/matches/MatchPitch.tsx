import { HeartPulse } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import type { Match, MatchSide } from '../../services/types';
import { SECTORS_TOP_DOWN, compareSquad, sectorOf, type Sector } from '../clubs/lineup';
import { initialsOf } from '../players/labels';
import { BallIcon } from './BallIcon';
import { TIRED_HINT } from './labels';
import { playersOf, type FieldPlayer } from './matchPlayers';

interface MatchPitchProps {
  match: Match;
}

type Team = 'home' | 'away';

// Em que ponto do campo (de 0 a 100, da própria meta para o meio) fica cada setor.
const SECTOR_X: Record<Sector, number> = { goalkeeper: 7, defense: 21, midfield: 35, attack: 46 };

const STRIPES: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 10%, transparent 10% 20%)',
};

function lastName(name: string): string {
  return name.split(' ').filter(Boolean).at(-1) ?? name;
}

function Disc({ player, team, x, y }: { player: FieldPlayer; team: Team; x: number; y: number }) {
  const details = [
    player.position,
    player.uses.map((used) => `${used.short} ${used.value}`).join(' '),
  ].join(' · ');

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className={cn(
          'relative grid size-9 place-items-center rounded-full text-xs font-semibold ring-2 ring-white/70',
          team === 'home' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900',
        )}
      >
        {initialsOf(player.name)}
        {player.condition === 'MAL_CONDICIONADO' && (
          <span
            title={TIRED_HINT}
            className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-orange-500 text-white ring-1 ring-white"
          >
            <HeartPulse aria-label={TIRED_HINT} className="size-2.5" />
          </span>
        )}
        {player.scored && (
          <span
            title="Fez gol"
            className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-white text-slate-900 ring-1 ring-slate-300"
          >
            <BallIcon aria-label="Fez gol" className="size-3" />
          </span>
        )}
      </span>
      <span className="rounded-full bg-white/90 px-2 py-px text-[0.65rem] font-medium whitespace-nowrap text-foreground">
        {lastName(player.name)}
      </span>
      <span className="text-[0.6rem] whitespace-nowrap text-white/90">{details}</span>
    </div>
  );
}

function TeamTag({ side, team }: { side: MatchSide; team: Team }) {
  return (
    <span
      className={cn(
        'absolute top-3 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-xs text-white',
        team === 'home' ? 'left-4' : 'right-4',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2.5 rounded-full', team === 'home' ? 'bg-blue-500' : 'bg-white')}
      />
      <span className="font-medium">{side.club_name}</span>
      <span>{side.formation}</span>
      <span aria-hidden="true" className="opacity-60">
        |
      </span>
      <span>{team === 'home' ? 'ataca →' : '← ataca'}</span>
    </span>
  );
}

// O jogo visto de cima: o mandante à esquerda, o visitante à direita, cada um na sua formação.
export function MatchPitch({ match }: MatchPitchProps) {
  const players = playersOf(match);
  const teams: { team: Team; side: MatchSide }[] = [
    { team: 'home', side: match.home },
    { team: 'away', side: match.away },
  ];

  return (
    <div className="overflow-x-auto rounded-xl">
      <div
        data-slot="pitch"
        className="relative aspect-[2.35/1] min-w-[680px] overflow-hidden rounded-xl bg-emerald-800"
        style={STRIPES}
      >
        <div aria-hidden="true" className="absolute inset-3 rounded-sm border border-white/50" />
        <div aria-hidden="true" className="absolute inset-y-3 left-1/2 w-px bg-white/50" />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50"
        />
        {(['left-3 border-l-0', 'right-3 border-r-0'] as const).map((edge) => (
          <div key={edge}>
            <div
              aria-hidden="true"
              className={cn(
                'absolute top-1/2 h-[46%] w-[15%] -translate-y-1/2 border border-white/50',
                edge,
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                'absolute top-1/2 h-[22%] w-[6%] -translate-y-1/2 border border-white/50',
                edge,
              )}
            />
          </div>
        ))}

        {teams.map(({ team, side }) => (
          <div key={team}>
            <TeamTag side={side} team={team} />
            {SECTORS_TOP_DOWN.map((sector) => {
              const column = players
                .filter(
                  (player) =>
                    player.clubId === side.club_id && sectorOf(player.position) === sector,
                )
                .sort((a, b) => compareSquad(a, b));
              const x = team === 'home' ? SECTOR_X[sector] : 100 - SECTOR_X[sector];

              return column.map((player, index) => (
                <Disc
                  key={player.id}
                  player={player}
                  team={team}
                  x={x}
                  y={((index + 1) / (column.length + 1)) * 100}
                />
              ));
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
