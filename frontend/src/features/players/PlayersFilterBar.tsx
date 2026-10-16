import { CircleDollarSign, HeartPulse, Shield, Shirt, UserRound } from 'lucide-react';
import { FilterSelect } from '../../components/filters/FilterSelect';
import { RangeFilter } from '../../components/filters/RangeFilter';
import { SearchInput } from '../../components/filters/SearchInput';
import { Button } from '../../components/ui/button';
import type { Club, PlayersFilters } from '../../services/types';
import { ageSummary, valueSummary } from './filterLabels';
import type { FilterDraft, FilterErrors } from './filters';
import { CONDITION_OPTIONS, POSITION_OPTIONS } from './labels';

interface PlayersFilterBarProps {
  draft: FilterDraft;
  /** Os filtros que a API recebeu: é deles que vêm os textos "Idade: 18 a 30". */
  applied: PlayersFilters;
  errors: FilterErrors;
  searchInput: string;
  clubs: Club[];
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<FilterDraft>) => void;
  onClear: () => void;
}

// Todos os filtros numa linha só, sempre à vista; cada botão mostra o que está valendo.
export function PlayersFilterBar(props: PlayersFilterBarProps) {
  const { draft, applied, errors, searchInput, clubs, hasFilters } = props;
  const { onSearchChange, onChange, onClear } = props;

  const clubOptions = clubs.map((club) => ({
    value: String(club.id),
    label: `${club.name} (${club.acronym})`,
  }));

  return (
    <div
      role="search"
      aria-label="Filtros"
      className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border bg-background p-2"
    >
      <SearchInput
        label="Buscar por nome"
        placeholder="Buscar jogador"
        title="Digite ao menos 2 letras para buscar"
        className="w-full sm:w-auto sm:max-w-56 sm:min-w-36 sm:flex-1 sm:basis-36"
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <FilterSelect
        label="Posição"
        icon={Shirt}
        clearLabel="Todas as posições"
        options={POSITION_OPTIONS}
        value={draft.position}
        onValueChange={(next) => onChange({ position: next as FilterDraft['position'] })}
      />
      <FilterSelect
        label="Condição"
        icon={HeartPulse}
        clearLabel="Todas as condições"
        options={CONDITION_OPTIONS}
        value={draft.condition}
        onValueChange={(next) => onChange({ condition: next as FilterDraft['condition'] })}
      />
      <FilterSelect
        label="Clube"
        icon={Shield}
        clearLabel="Todos os clubes"
        options={clubOptions}
        value={draft.clubId}
        disabled={draft.scope === 'free'}
        disabledReason="Jogadores livres não têm clube."
        onValueChange={(next) => onChange({ clubId: next })}
      />
      <RangeFilter
        label="Idade"
        icon={UserRound}
        summary={ageSummary(applied)}
        error={errors.age}
        minLabel="Idade mínima"
        maxLabel="Idade máxima"
        minValue={draft.minAge}
        maxValue={draft.maxAge}
        inputMode="numeric"
        onMinChange={(value) => onChange({ minAge: value })}
        onMaxChange={(value) => onChange({ maxAge: value })}
        onClear={() => onChange({ minAge: '', maxAge: '' })}
      />
      <RangeFilter
        label="Valor"
        title="Valor de mercado"
        icon={CircleDollarSign}
        summary={valueSummary(applied)}
        error={errors.value}
        minLabel="Valor mínimo"
        maxLabel="Valor máximo"
        minValue={draft.minValue}
        maxValue={draft.maxValue}
        inputMode="decimal"
        onMinChange={(value) => onChange({ minValue: value })}
        onMaxChange={(value) => onChange({ maxValue: value })}
        onClear={() => onChange({ minValue: '', maxValue: '' })}
      />
      {hasFilters && (
        <Button variant="link" size="sm" onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
