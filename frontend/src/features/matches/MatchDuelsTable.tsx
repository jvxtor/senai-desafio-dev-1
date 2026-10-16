import { HeartPulse } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { cn } from '../../lib/utils';
import type { Club, Duel, DuelParticipant, Match, MatchSide } from '../../services/types';
import { PlayerAvatar } from '../players/PlayerAvatar';
import { BallIcon } from './BallIcon';
import { ATTRIBUTE_LABELS, TIRED_HINT } from './labels';
import { playersOf, type FieldPlayer } from './matchPlayers';

interface MatchDuelsTableProps {
  match: Match;
  clubs: Club[];
}

const HEADERS = [
  { label: 'Duelo', align: 'left' },
  { label: 'Atacante', align: 'left' },
  { label: 'Ataque', align: 'left' },
  { label: 'Defensor', align: 'left' },
  { label: 'Defesa', align: 'left' },
  { label: 'Resultado', align: 'left' },
] as const;

const CELL = 'px-3 py-3';

const goalsText = (goals: number) => `${goals} ${goals === 1 ? 'gol' : 'gols'}`;

function Who(props: {
  participant: DuelParticipant;
  clubName: string;
  lines: Map<number, FieldPlayer>;
}) {
  const { participant, clubName, lines } = props;
  const lineNumber = lines.get(participant.player_id)?.lineNumber;
  const role =
    participant.position === 'GOL'
      ? 'Goleiro'
      : `${participant.position}${lineNumber ? `, ${lineNumber}º de linha` : ''}`;

  return (
    <div className="flex items-center gap-3">
      <PlayerAvatar name={participant.player_name} position={participant.position} size="lg" />
      <div className="min-w-0">
        <p className="font-medium">{participant.player_name}</p>
        <p className="text-xs text-muted-foreground">
          {role} · {clubName}
        </p>
      </div>
    </div>
  );
}

function Value({ participant }: { participant: DuelParticipant }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground">{ATTRIBUTE_LABELS[participant.attribute]}</span>
      <span className="font-semibold tabular-nums">{participant.value}</span>
      {participant.condition === 'MAL_CONDICIONADO' && (
        <span title={TIRED_HINT} className="text-orange-500">
          <HeartPulse aria-label={TIRED_HINT} className="size-3.5" />
        </span>
      )}
    </span>
  );
}

function GroupRow(props: { side: MatchSide; acronym: string; role: string; goals: number }) {
  const { side, acronym, role, goals } = props;

  return (
    <TableRow className="bg-muted/40 hover:bg-muted/40">
      <TableCell colSpan={HEADERS.length} className="px-3 py-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2">
            <span className="rounded bg-background px-1.5 py-0.5 font-semibold ring-1 ring-border">
              {acronym}
            </span>
            <span className="font-medium">
              Ataques do {side.club_name} ({role})
            </span>
          </span>
          <span className="text-muted-foreground">{goalsText(goals)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DuelRow(props: {
  duel: Duel;
  attackerClub: string;
  defenderClub: string;
  lines: Map<number, FieldPlayer>;
}) {
  const { duel, attackerClub, defenderClub, lines } = props;

  return (
    <TableRow>
      <TableCell className={cn(CELL, 'tabular-nums')}>{duel.order}</TableCell>
      <TableCell className={CELL}>
        <Who participant={duel.attacker} clubName={attackerClub} lines={lines} />
      </TableCell>
      <TableCell className={CELL}>
        <Value participant={duel.attacker} />
      </TableCell>
      <TableCell className={CELL}>
        <Who participant={duel.defender} clubName={defenderClub} lines={lines} />
      </TableCell>
      <TableCell className={CELL}>
        <Value participant={duel.defender} />
      </TableCell>
      <TableCell className={CELL}>
        {duel.goal ? (
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            <BallIcon className="size-3.5" />
            Gol
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Sem gol
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

// Os 6 duelos: primeiro os 3 ataques do mandante, depois os 3 do visitante.
export function MatchDuelsTable({ match, clubs }: MatchDuelsTableProps) {
  const lines = new Map(playersOf(match).map((player) => [player.id, player]));
  const acronym = (clubId: number) => clubs.find((club) => club.id === clubId)?.acronym ?? '';

  const groups = [
    { side: match.home, other: match.away, role: 'mandante' },
    { side: match.away, other: match.home, role: 'visitante' },
  ];

  return (
    <Table>
      <TableHeader className="bg-neutral-50">
        <TableRow>
          {HEADERS.map((header) => (
            <TableHead
              key={header.label}
              className={cn(CELL, 'h-auto text-sm font-normal text-muted-foreground')}
            >
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(({ side, other, role }) => {
          const duels = match.duels.filter((duel) => duel.attacking_club_id === side.club_id);

          return [
            <GroupRow
              key={`group-${side.club_id}`}
              side={side}
              acronym={acronym(side.club_id)}
              role={role}
              goals={side.goals}
            />,
            ...duels.map((duel) => (
              <DuelRow
                key={duel.order}
                duel={duel}
                attackerClub={side.club_name}
                defenderClub={other.club_name}
                lines={lines}
              />
            )),
          ];
        })}
      </TableBody>
    </Table>
  );
}
