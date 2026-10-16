import { SelectField } from '../../components/forms/fields';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import type { PlayerSort } from '../../services/types';
import type { Scope } from './filters';
import { SORT_OPTIONS } from './labels';

interface PlayersToolbarProps {
  scope: Scope;
  sort: PlayerSort;
  onScopeChange: (scope: Scope) => void;
  onSortChange: (sort: PlayerSort) => void;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'free', label: 'Livres' },
  { value: 'club', label: 'Em clubes' },
];

export function PlayersToolbar(props: PlayersToolbarProps) {
  const { scope, sort, onScopeChange, onSortChange } = props;

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <Tabs value={scope} onValueChange={(next) => onScopeChange(next as Scope)}>
        <TabsList aria-label="Mostrar">
          {SCOPES.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="px-3">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SelectField
        label="Ordenar por"
        hideLabel
        className="w-56"
        options={SORT_OPTIONS}
        value={sort}
        onValueChange={(next) => onSortChange(next as PlayerSort)}
      />
    </div>
  );
}
