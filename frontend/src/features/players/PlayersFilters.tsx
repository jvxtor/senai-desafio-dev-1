import { RotateCcw } from 'lucide-react';
import { SelectField, TextField } from '../../components/forms/fields';
import { Button } from '../../components/ui/button';
import type { Club } from '../../services/types';
import type { FilterDraft, FilterErrors } from './filters';
import { CONDITION_OPTIONS, POSITION_OPTIONS } from './labels';

interface PlayersFiltersProps {
  draft: FilterDraft;
  searchInput: string;
  errors: FilterErrors;
  clubs: Club[];
  isFiltering: boolean;
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<FilterDraft>) => void;
  onReset: () => void;
}

function RangeError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

export function PlayersFilters(props: PlayersFiltersProps) {
  const { draft, searchInput, errors, clubs, isFiltering } = props;
  const { onSearchChange, onChange, onReset } = props;

  const clubOptions = clubs.map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym})`,
  }));

  return (
    <section aria-label="Filtros" className="shrink-0 rounded-xl border bg-background p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TextField
          label="Buscar por nome"
          hideLabel
          type="search"
          placeholder="Buscar por nome"
          className="col-span-2 lg:col-span-1"
          value={searchInput}
          error={errors.search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <SelectField
          label="Posição"
          hideLabel
          placeholder="Posição"
          options={POSITION_OPTIONS}
          value={draft.position}
          onValueChange={(next) => onChange({ position: next as FilterDraft['position'] })}
        />
        <SelectField
          label="Condição"
          hideLabel
          placeholder="Condição"
          options={CONDITION_OPTIONS}
          value={draft.condition}
          onValueChange={(next) => onChange({ condition: next as FilterDraft['condition'] })}
        />
        <SelectField
          label="Clube"
          hideLabel
          placeholder="Todos os clubes"
          className="col-span-2 lg:col-span-1"
          options={clubOptions}
          value={draft.clubId}
          disabled={draft.scope === 'free'}
          hint={draft.scope === 'free' ? 'Jogadores livres não têm clube.' : undefined}
          onValueChange={(next) => onChange({ clubId: next })}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3">
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Idade</legend>
          <div className="flex items-center gap-2">
            <TextField
              label="Idade mínima"
              hideLabel
              inputMode="numeric"
              placeholder="Mín."
              className="w-20"
              value={draft.minAge}
              onChange={(event) => onChange({ minAge: event.target.value })}
            />
            <span aria-hidden="true" className="text-muted-foreground">–</span>
            <TextField
              label="Idade máxima"
              hideLabel
              inputMode="numeric"
              placeholder="Máx."
              className="w-20"
              value={draft.maxAge}
              onChange={(event) => onChange({ maxAge: event.target.value })}
            />
          </div>
          <RangeError message={errors.age} />
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
            Valor de mercado
          </legend>
          <div className="flex items-center gap-2">
            <TextField
              label="Valor mínimo"
              hideLabel
              inputMode="decimal"
              placeholder="Mín."
              className="w-24"
              value={draft.minValue}
              onChange={(event) => onChange({ minValue: event.target.value })}
            />
            <span aria-hidden="true" className="text-muted-foreground">–</span>
            <TextField
              label="Valor máximo"
              hideLabel
              inputMode="decimal"
              placeholder="Máx."
              className="w-24"
              value={draft.maxValue}
              onChange={(event) => onChange({ maxValue: event.target.value })}
            />
          </div>
          <RangeError message={errors.value} />
        </fieldset>

        {isFiltering && (
          <Button variant="ghost" className="mt-5" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            Limpar filtros
          </Button>
        )}
      </div>
    </section>
  );
}
