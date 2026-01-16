import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { Flight, SearchParams, FilterState, SortState, RecentSearch } from '@/types'
import { DEFAULT_FILTERS, DEFAULT_SORT, STORAGE_KEYS } from '@/utils/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// State types
interface SearchState {
  // Search
  searchParams: SearchParams | null
  isSearching: boolean
  searchError: string | null

  // Results
  flights: Flight[]
  totalResults: number

  // Filters
  filters: FilterState
  sort: SortState

  // UI
  isFiltersOpen: boolean
}

// Action types
type SearchAction =
  | { type: 'SET_SEARCH_PARAMS'; payload: SearchParams }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_SEARCH_ERROR'; payload: string | null }
  | { type: 'SET_FLIGHTS'; payload: { flights: Flight[]; total: number } }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_SORT'; payload: SortState }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'CLEAR_RESULTS' }

// Initial state
const initialState: SearchState = {
  searchParams: null,
  isSearching: false,
  searchError: null,
  flights: [],
  totalResults: 0,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  isFiltersOpen: true,
}

// Reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_SEARCH_PARAMS':
      return { ...state, searchParams: action.payload, searchError: null }
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload }
    case 'SET_SEARCH_ERROR':
      return { ...state, searchError: action.payload, isSearching: false }
    case 'SET_FLIGHTS':
      return {
        ...state,
        flights: action.payload.flights,
        totalResults: action.payload.total,
        isSearching: false,
        searchError: null,
      }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_SORT':
      return { ...state, sort: action.payload }
    case 'RESET_FILTERS':
      return { ...state, filters: DEFAULT_FILTERS }
    case 'TOGGLE_FILTERS':
      return { ...state, isFiltersOpen: !state.isFiltersOpen }
    case 'CLEAR_RESULTS':
      return { ...state, flights: [], totalResults: 0, searchError: null }
    default:
      return state
  }
}

// Context
interface SearchContextType {
  state: SearchState
  dispatch: Dispatch<SearchAction>
  recentSearches: RecentSearch[]
  addRecentSearch: (search: RecentSearch) => void
  clearRecentSearches: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Provider
interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState)
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>(
    STORAGE_KEYS.RECENT_SEARCHES,
    []
  )

  const addRecentSearch = useCallback(
    (search: RecentSearch) => {
      setRecentSearches((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter(
          (s) =>
            s.params.origin !== search.params.origin ||
            s.params.destination !== search.params.destination ||
            s.params.departureDate !== search.params.departureDate
        )
        // Add new search at beginning, keep max 5
        return [search, ...filtered].slice(0, 5)
      })
    },
    [setRecentSearches]
  )

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
  }, [setRecentSearches])

  return (
    <SearchContext.Provider
      value={{ state, dispatch, recentSearches, addRecentSearch, clearRecentSearches }}
    >
      {children}
    </SearchContext.Provider>
  )
}

// Hook
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
