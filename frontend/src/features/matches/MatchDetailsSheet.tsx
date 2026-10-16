import { HeartPulse } from 'lucide-react';
import { DataState } from '../../components/common/DataState';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { useMatch } from '../../hooks/matches';
import { formatDate, formatTime } from '../../lib/format';
import type { Duel, DuelParticipant, Match } from '../../services/types';
import { PlayerAvatar } from '../players/PlayerAvatar';
import { ATTRIBUTE_LABELS, RESULT_LABELS, RESULT_STYLE, TIRED_HINT } from './labels';

interface MatchDetailsSheetProps {
  matchId: number;
  onClose: () => void;
}

// Uma linha do duelo: quem é, que atributo usou e o valor (já com o efeito da condição).
function Participant({ player, role }: { player: DuelParticipant; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <PlayerAvatar name={player.player_name} position={player.position} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{player.player_name}</p>
        <p className="text-xs text-muted-foreground">
          {role} · {player.position} · {ATTRIBUTE_LABELS[player.attribute]}
        </p>
      </div>
      <p className="flex items-center gap-1 text-lg font-semibold tabular-nums">
        {player.condition === 'MAL_CONDICIONADO' && (
          <span title={TIRED_HINT} className="text-orange-500">
            <HeartPulse aria-label={TIRED_HINT} className="size-3.5" />
          </span>
        )}
        {player.value}
      </p>
    </div>
  );
}

function DuelCard({ duel }: { duel: Duel }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-background p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Duelo {duel.order}</span>
        {duel.goal ? (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Gol
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Defendeu
          </Badge>
        )}
      </div>
      <Participant player={duel.attacker} role="Ataca" />
      <Participant player={duel.defender} role="Defende" />
    </li>
  );
}

function DuelGroup({
  match,
  clubId,
  clubName,
}: {
  match: Match;
  clubId: number;
  clubName: string;
}) {
  const duels = match.duels.filter((duel) => duel.attacking_club_id === clubId);

  return (
    <section aria-label={`Ataques do ${clubName}`} className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Ataques do {clubName}</h3>
      <ul className="flex flex-col gap-2">
        {duels.map((duel) => (
          <DuelCard key={duel.order} duel={duel} />
        ))}
      </ul>
    </section>
  );
}

// Tudo sobre uma partida: o placar, a formação de cada lado e os 6 duelos, um a um.
export function MatchDetailsSheet({ matchId, onClose }: MatchDetailsSheetProps) {
  const query = useMatch(matchId);
  const match = query.data;

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="p-4 pr-12">
          <SheetTitle className="text-lg">Detalhes da partida</SheetTitle>
          <SheetDescription>
            {match
              ? `${formatDate(match.played_at)} às ${formatTime(match.played_at)}`
              : 'Carregando a partida…'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
          <DataState
            isPending={query.isPending}
            error={query.error}
            isEmpty={false}
            onRetry={() => void query.refetch()}
            loadingLabel="Carregando a partida…"
            empty={null}
          >
            {match && (
              <>
                <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/40 p-4">
                  <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                    <div>
                      <p className="font-medium">{match.home.club_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Formação {match.home.formation}
                      </p>
                    </div>
                    <p className="text-3xl font-semibold tabular-nums">
                      {match.home.goals} × {match.away.goals}
                    </p>
                    <div>
                      <p className="font-medium">{match.away.club_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Formação {match.away.formation}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={RESULT_STYLE[match.result]}>
                    {RESULT_LABELS[match.result]}
                  </Badge>
                </div>

                <DuelGroup
                  match={match}
                  clubId={match.home.club_id}
                  clubName={match.home.club_name}
                />
                <DuelGroup
                  match={match}
                  clubId={match.away.club_id}
                  clubName={match.away.club_name}
                />

                <p className="text-xs text-muted-foreground">
                  É gol quando o ataque é maior que a defesa. Quem está mal condicionado joga com
                  15% a menos em cada atributo.
                </p>
              </>
            )}
          </DataState>
        </div>

        <SheetFooter className="border-t">
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
