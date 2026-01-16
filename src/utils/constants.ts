import type { CabinClass, FilterState, SortState } from '@/types'

// API Configuration
export const AMADEUS_API_URL = 'https://test.api.amadeus.com'
export const AMADEUS_AUTH_URL = `${AMADEUS_API_URL}/v1/security/oauth2/token`
export const AMADEUS_FLIGHTS_URL = `${AMADEUS_API_URL}/v2/shopping/flight-offers`
export const AMADEUS_LOCATIONS_URL = `${AMADEUS_API_URL}/v1/reference-data/locations`

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Filter defaults
export const DEFAULT_FILTERS: FilterState = {
  airlines: [],
  stops: null,
  priceRange: [0, 10000],
  departureTimeRange: [0, 24],
  cabinClasses: [],
}

// Sort defaults
export const DEFAULT_SORT: SortState = {
  field: 'price',
  direction: 'asc',
}

// Cabin class options
export const CABIN_CLASS_OPTIONS: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First Class' },
]

// Stop options
export const STOP_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 0, label: 'Nonstop only' },
  { value: 1, label: '1 stop or fewer' },
  { value: 2, label: '2 stops or fewer' },
]

// Popular airlines (for display names)
export const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  UA: 'United Airlines',
  DL: 'Delta Air Lines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  F9: 'Frontier Airlines',
  NK: 'Spirit Airlines',
  BA: 'British Airways',
  LH: 'Lufthansa',
  AF: 'Air France',
  KL: 'KLM',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific',
  JL: 'Japan Airlines',
  NH: 'ANA',
  TK: 'Turkish Airlines',
  LX: 'Swiss',
  OS: 'Austrian',
  IB: 'Iberia',
  AY: 'Finnair',
  SK: 'SAS',
  EI: 'Aer Lingus',
  VS: 'Virgin Atlantic',
  AC: 'Air Canada',
  QF: 'Qantas',
  NZ: 'Air New Zealand',
  LA: 'LATAM',
  AM: 'Aeroméxico',
  AV: 'Avianca',
  CM: 'Copa Airlines',
  ET: 'Ethiopian Airlines',
  MS: 'EgyptAir',
  SV: 'Saudia',
  GF: 'Gulf Air',
  WY: 'Oman Air',
  UL: 'SriLankan Airlines',
  AI: 'Air India',
  SU: 'Aeroflot',
  LO: 'LOT Polish Airlines',
  OK: 'Czech Airlines',
  OU: 'Croatia Airlines',
  JU: 'Air Serbia',
  RO: 'TAROM',
  BT: 'airBaltic',
  FB: 'Bulgaria Air',
  PS: 'Ukraine International',
  VY: 'Vueling',
  FR: 'Ryanair',
  U2: 'easyJet',
  W6: 'Wizz Air',
}

// Table column defaults
export const DEFAULT_COLUMNS = [
  { id: 'airline', visible: true, order: 0 },
  { id: 'route', visible: true, order: 1 },
  { id: 'departure', visible: true, order: 2 },
  { id: 'arrival', visible: true, order: 3 },
  { id: 'duration', visible: true, order: 4 },
  { id: 'stops', visible: true, order: 5 },
  { id: 'class', visible: true, order: 6 },
  { id: 'price', visible: true, order: 7 },
]

// LocalStorage keys
export const STORAGE_KEYS = {
  THEME: 'flight-search-theme',
  TABLE_LAYOUT: 'flight-search-table-layout',
  RECENT_SEARCHES: 'flight-search-recent',
  COLUMN_VISIBILITY: 'flight-search-columns',
}

// Debounce delays (ms)
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  FILTER: 200,
  RESIZE: 100,
}

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
}

// Chart colors matching the design system
export const CHART_COLORS = {
  primary: 'hsl(239, 84%, 67%)', // indigo-500
  secondary: 'hsl(258, 90%, 66%)', // violet-500
  tertiary: 'hsl(280, 87%, 65%)', // purple-500
  success: 'hsl(142, 71%, 45%)', // green-500
  warning: 'hsl(38, 92%, 50%)', // amber-500
  muted: 'hsl(215, 16%, 47%)', // slate-500
}
