import { createContext, useContext, useState, type ReactNode } from 'react';

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ query, setQuery, isSearchOpen, setIsSearchOpen }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
}
