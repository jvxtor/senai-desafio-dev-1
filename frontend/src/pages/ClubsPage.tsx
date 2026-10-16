import { Plus, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataState } from '../components/common/DataState';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/filters/SearchInput';
import { SelectField } from '../components/forms/fields';
import { Button } from '../components/ui/button';
import { ClubFormDialog } from '../features/clubs/ClubFormDialog';
import { ClubsTable } from '../features/clubs/ClubsTable';
import { CLUB_SORT_OPTIONS, MAX_CLUBS } from '../features/clubs/labels';
import { useClubs } from '../hooks/clubs';
import { foldText } from '../lib/text';
import type { ClubSort } from '../services/types';

function ClubsPage() {
  const [sort, setSort] = useState<ClubSort>('name');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const clubs = useClubs(sort);

  const all = useMemo(() => clubs.data ?? [], [clubs.data]);
  const query = foldText(search.trim());
  // A API só ordena; a busca roda na lista, que tem no máximo 20 clubes.
  const visible = useMemo(
    () =>
      query === ''
        ? all
        : all.filter((club) => foldText(`${club.name} ${club.acronym}`).includes(query)),
    [all, query],
  );

  const isFull = all.length >= MAX_CLUBS;
  const newClubButton = (
    <Button
      onClick={() => setCreating(true)}
      disabled={isFull}
      title={isFull ? `A liga aceita no máximo ${MAX_CLUBS} clubes.` : undefined}
    >
      <Plus aria-hidden="true" />
      Novo clube
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 short:gap-3 lg:h-full">
      <PageHeader
        icon={Shield}
        title="Clubes"
        description="Acompanhe o caixa, o valor do elenco e o patrimônio de cada clube da liga."
        action={newClubButton}
      />

      <div
        role="search"
        aria-label="Buscar e ordenar clubes"
        className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border bg-background p-2"
      >
        <SearchInput
          label="Buscar clube"
          placeholder="Buscar clube"
          title="Busca pelo nome ou pela sigla, sem diferenciar acentos"
          className="w-full sm:max-w-72 sm:flex-1"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search !== '' && (
          <Button variant="link" size="sm" onClick={() => setSearch('')}>
            Limpar busca
          </Button>
        )}
        <SelectField
          label="Ordenar por"
          hideLabel
          className="w-full sm:ml-auto sm:w-56"
          options={CLUB_SORT_OPTIONS}
          value={sort}
          onValueChange={(next) => setSort(next as ClubSort)}
        />
      </div>

      <section
        aria-label="Lista de clubes"
        className="flex min-h-0 flex-col rounded-xl border bg-background lg:min-h-56 lg:flex-1"
      >
        <DataState
          isPending={clubs.isPending}
          error={clubs.error}
          isEmpty={clubs.isSuccess && visible.length === 0}
          onRetry={() => void clubs.refetch()}
          loadingLabel="Carregando clubes…"
          empty={
            all.length > 0 ? (
              <>
                <p className="text-sm font-medium">Nenhum clube encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Nenhum clube tem “{search.trim()}” no nome ou na sigla.
                </p>
                <Button variant="outline" onClick={() => setSearch('')}>
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Ainda não há clubes</p>
                <p className="text-sm text-muted-foreground">
                  Cadastre o primeiro clube para montar a liga.
                </p>
                <Button onClick={() => setCreating(true)}>
                  <Plus aria-hidden="true" />
                  Novo clube
                </Button>
              </>
            )
          }
        >
          <div
            className={`min-h-0 flex-1 transition-opacity ${clubs.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            <ClubsTable clubs={visible} />
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {visible.length === all.length
                ? `${all.length} ${all.length === 1 ? 'clube' : 'clubes'}`
                : `Mostrando ${visible.length} de ${all.length} clubes`}
            </p>
            <p className="text-xs text-muted-foreground">
              A liga aceita no máximo {MAX_CLUBS} clubes.
            </p>
          </footer>
        </DataState>
      </section>

      {creating && <ClubFormDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

export default ClubsPage;
