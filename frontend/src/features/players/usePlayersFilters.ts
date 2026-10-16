import { useMemo, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  buildPlayersFilters,
  EMPTY_DRAFT,
  hasActiveFilters,
  hasBarFilters,
  PANEL_FILTERS_RESET,
  type FilterDraft,
} from './filters';

const SEARCH_DELAY_MS = 300;

interface PageState {
  /** Os filtros para os quais esta página vale. Se mudarem, volta para a página 1. */
  key: string;
  value: number;
}

export function usePlayersFilters() {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [searchInput, setSearchInput] = useState('');
  const [pageState, setPageState] = useState<PageState>({ key: '', value: 1 });
  const search = useDebouncedValue(searchInput, SEARCH_DELAY_MS);

  const { filters, errors, filtersKey } = useMemo(() => {
    const first = buildPlayersFilters(draft, search, 1);
    const key = JSON.stringify({ ...first.filters, page: undefined });
    const page = pageState.key === key ? pageState.value : 1;

    return {
      filters: { ...first.filters, page },
      errors: first.errors,
      filtersKey: key,
    };
  }, [draft, search, pageState]);

  // Mudar qualquer filtro volta para a página 1, inclusive ao retornar a uma combinação já usada.
  function goToFirstPage() {
    setPageState({ key: '', value: 1 });
  }

  function changeSearch(value: string) {
    setSearchInput(value);
    goToFirstPage();
  }

  function update(patch: Partial<FilterDraft>) {
    goToFirstPage();
    setDraft((current) => {
      const next = { ...current, ...patch };
      // A API recusa "só livres" junto com um clube: escolher um limpa o outro.
      if (patch.scope === 'free') next.clubId = '';
      if (patch.clubId && next.scope === 'free') next.scope = 'all';
      return next;
    });
  }

  function clearBarFilters() {
    update(PANEL_FILTERS_RESET);
    changeSearch('');
  }

  function reset() {
    goToFirstPage();
    setDraft((current) => ({ ...EMPTY_DRAFT, sort: current.sort }));
    setSearchInput('');
  }

  return {
    draft,
    searchInput,
    errors,
    filters,
    isFiltering: hasActiveFilters(draft, searchInput),
    hasBarFilters: hasBarFilters(draft, searchInput),
    setSearchInput: changeSearch,
    update,
    reset,
    clearBarFilters,
    setPage: (value: number) => setPageState({ key: filtersKey, value }),
  };
}
