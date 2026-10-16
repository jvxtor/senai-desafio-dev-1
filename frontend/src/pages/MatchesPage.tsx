import { Plus, Shield, Swords } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DataState } from '../components/common/DataState';
import { PageHeader } from '../components/common/PageHeader';
import { FilterSelect } from '../components/filters/FilterSelect';
import { Button } from '../components/ui/button';
import { LastMatchCard } from '../features/matches/LastMatchCard';
import { MatchesTable } from '../features/matches/MatchesTable';
import { NewMatchDialog } from '../features/matches/NewMatchDialog';
import { useClubs } from '../hooks/clubs';
import { useMatches } from '../hooks/matches';

function MatchesPage() {
  const [clubId, setClubId] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const openMatch = (id: number) => void navigate(`/partidas/${id}`);

  const clubs = useClubs();
  const matches = useMatches(clubId ? Number(clubId) : undefined);
  // O total da liga, sem filtro: decide entre "ainda não há partidas" e "nenhuma deste clube".
  const everything = useMatches();

  const list = matches.data ?? [];
  const leagueHasMatches = (everything.data?.length ?? 0) > 0;
  const clubOptions = (clubs.data ?? []).map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym})`,
  }));

  const newMatchButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus aria-hidden="true" />
      Nova partida
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 short:gap-3 lg:h-full">
      <PageHeader
        icon={Swords}
        title="Partidas"
        description="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        action={newMatchButton}
      />

      {list[0] && (
        <LastMatchCard
          match={list[0]}
          clubs={clubs.data ?? []}
          clubName={clubOptions.find((option) => option.value === clubId)?.label}
          onOpen={(match) => openMatch(match.id)}
        />
      )}

      <section
        aria-label="Lista de partidas"
        className="flex min-h-0 flex-col rounded-xl border bg-background lg:min-h-56 lg:flex-1"
      >
        {leagueHasMatches && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <FilterSelect
              label="Clube"
              emptyText="Clube: todos"
              icon={Shield}
              clearLabel="Todos os clubes"
              options={clubOptions}
              value={clubId}
              onValueChange={setClubId}
            />
            {matches.isSuccess && (
              <span className="text-xs text-muted-foreground">
                {list.length} {list.length === 1 ? 'partida' : 'partidas'}
              </span>
            )}
          </div>
        )}

        <DataState
          isPending={matches.isPending}
          error={matches.error}
          isEmpty={matches.isSuccess && list.length === 0}
          onRetry={() => void matches.refetch()}
          loadingLabel="Carregando partidas…"
          empty={
            <>
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"
              >
                <Swords className="size-5" />
              </span>
              {clubId ? (
                <>
                  <p className="text-base font-semibold">Nenhuma partida desse clube</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Esse clube ainda não jogou. Escolha outro clube ou jogue uma partida.
                  </p>
                  <Button variant="outline" onClick={() => setClubId('')}>
                    Ver todos os clubes
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold">Nenhuma partida jogada</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado
                    aparece aqui e na classificação.
                  </p>
                  <Button variant="outline" onClick={() => setCreating(true)}>
                    <Plus aria-hidden="true" />
                    Nova partida
                  </Button>
                </>
              )}
            </>
          }
        >
          <MatchesTable matches={list} onSelect={(match) => openMatch(match.id)} />
        </DataState>
      </section>

      <p className="shrink-0 text-xs text-muted-foreground short:hidden">
        {everything.isSuccess && !leagueHasMatches
          ? 'Nenhuma partida jogada ainda. A classificação continua com todos os clubes, zerados.'
          : 'Da mais recente para a mais antiga. É gol quando o ataque é maior que a defesa.'}
      </p>

      {creating && (
        <NewMatchDialog
          onClose={() => setCreating(false)}
          onPlayed={(match) => openMatch(match.id)}
        />
      )}
    </div>
  );
}

export default MatchesPage;
