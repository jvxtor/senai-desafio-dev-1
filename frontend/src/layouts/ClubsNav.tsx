import { Plus } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { Skeleton } from '../components/ui/skeleton';
import { useClubs } from '../hooks/clubs';
import { cn } from '../lib/utils';

const FOCUS = 'outline-none focus-visible:ring-3 focus-visible:ring-ring/50';

// Todos os clubes da liga na barra lateral, em ordem de nome, cada um levando à sua tela.
export function ClubsNav() {
  const clubs = useClubs();

  return (
    <nav aria-label="Clubes" className="flex min-h-0 flex-col gap-1">
      <div className="flex shrink-0 items-center justify-between px-2.5 pb-1">
        <NavLink
          to="/clubes"
          end
          className={({ isActive }) =>
            cn(
              'rounded-sm text-xs font-medium',
              FOCUS,
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          Clubes
        </NavLink>
        <Link
          to="/clubes?novo=1"
          aria-label="Novo clube"
          title="Novo clube"
          className={cn(
            'grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground',
            FOCUS,
          )}
        >
          <Plus aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {clubs.isPending && (
        <div role="status" aria-label="Carregando clubes" className="flex flex-col gap-1">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-8 w-full" />
          ))}
        </div>
      )}

      {clubs.isError && (
        <p className="px-2.5 text-xs text-muted-foreground">
          Não foi possível carregar os clubes.{' '}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground"
            onClick={() => void clubs.refetch()}
          >
            Tentar de novo
          </button>
        </p>
      )}

      {clubs.isSuccess && clubs.data.length === 0 && (
        <p className="px-2.5 text-xs text-muted-foreground">Nenhum clube cadastrado.</p>
      )}

      {clubs.isSuccess && clubs.data.length > 0 && (
        <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
          {clubs.data.map((club) => (
            <li key={club.id}>
              <NavLink
                to={`/clubes/${club.id}`}
                title={`${club.name} (${club.acronym})`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm',
                    FOCUS,
                    isActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-md text-xs font-medium',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      {club.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{club.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
