import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { FlowSteps } from './components/home/FlowSteps';
import { LeagueStats } from './components/home/LeagueStats';
import { LeagueStatus } from './components/home/LeagueStatus';
import { PitchMarkings } from './components/home/PitchMarkings';
import { Button } from './components/ui/button';
import { useEnterToNavigate } from './hooks/useEnterToNavigate';
import { useLeagueOverview } from './hooks/league';

const START_PATH = '/jogadores';

function App() {
  const overview = useLeagueOverview();
  useEnterToNavigate(START_PATH);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl items-center p-4 sm:p-6 sm:short:p-3">
      <div className="relative w-full min-w-0 overflow-hidden rounded-[2rem] border bg-background">
        <PitchMarkings />

        <div className="relative flex flex-col items-center gap-6 px-5 py-8 text-center short:gap-4 sm:px-10 sm:py-12 sm:short:py-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground"
            >
              P
            </span>
            <span className="text-3xl font-semibold tracking-tight">Passe</span>
          </div>

          <LeagueStatus leader={overview.leader} />

          <div className="flex flex-col items-center gap-5 short:gap-3">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Gestão da liga, do mercado à classificação
            </h1>
            <p className="max-w-xl text-base text-balance text-muted-foreground short:max-w-2xl short:text-sm">
              Cadastre jogadores, monte os clubes e negocie com contrato de
              fidelidade. Depois, escale os titulares e jogue partidas com
              placar calculado pelos atributos.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              className="h-11 gap-2 px-10 has-data-[icon=inline-end]:pr-9"
              nativeButton={false}
              render={<Link to={START_PATH} />}
            >
              Iniciar
              <ArrowRight data-icon="inline-end" />
            </Button>
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              ou tecle
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[0.7rem]">
                Enter
              </kbd>
            </span>
          </div>

          <LeagueStats
            totalPlayers={overview.totalPlayers}
            freePlayers={overview.freePlayers}
            totalClubs={overview.totalClubs}
            totalMatches={overview.totalMatches}
          />

          <div className="mt-4 w-full short:mt-1">
            <FlowSteps />
          </div>

          <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5" />
            Liga Fictícia 2026 · Horário de Brasília (UTC−3)
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
