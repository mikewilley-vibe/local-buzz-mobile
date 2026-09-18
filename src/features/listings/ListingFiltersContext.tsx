import { createContext, useContext, useState, type ReactNode } from 'react';

import { EMPTY_FILTERS, type ListingFilterState } from '@/features/listings/filters';

type ListingFiltersContextValue = {
  filters: ListingFilterState;
  setFilters: (next: ListingFilterState) => void;
};

const ListingFiltersContext = createContext<ListingFiltersContextValue | null>(null);

export function ListingFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<ListingFilterState>(EMPTY_FILTERS);
  return (
    <ListingFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </ListingFiltersContext.Provider>
  );
}

export function useListingFilters() {
  const context = useContext(ListingFiltersContext);
  if (!context) throw new Error('Listing filters require ListingFiltersProvider');
  return context;
}
