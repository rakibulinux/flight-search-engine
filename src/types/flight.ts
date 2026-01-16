// Flight types
export interface FlightSegment {
  departure: {
    iataCode: string
    terminal?: string
    at: string
  }
  arrival: {
    iataCode: string
    terminal?: string
    at: string
  }
  carrierCode: string
  number: string
  aircraft: {
    code: string
  }
  operating?: {
    carrierCode: string
  }
  duration: string
  numberOfStops: number
}

export interface FlightItinerary {
  duration: string
  segments: FlightSegment[]
}

export interface FlightPrice {
  currency: string
  total: string
  base: string
  grandTotal: string
}

export interface FlightOffer {
  id: string
  source: string
  instantTicketingRequired: boolean
  nonHomogeneous: boolean
  oneWay: boolean
  lastTicketingDate: string
  numberOfBookableSeats: number
  itineraries: FlightItinerary[]
  price: FlightPrice
  validatingAirlineCodes: string[]
  travelerPricings: TravelerPricing[]
}

export interface TravelerPricing {
  travelerId: string
  fareOption: string
  travelerType: string
  price: {
    currency: string
    total: string
    base: string
  }
  fareDetailsBySegment: FareDetails[]
}

export interface FareDetails {
  segmentId: string
  cabin: string
  fareBasis: string
  class: string
  includedCheckedBags?: {
    weight?: number
    weightUnit?: string
    quantity?: number
  }
}

// Processed flight for display
export interface Flight {
  id: string
  airline: string
  airlineCode: string
  airlineName: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: number
  stopLocations: string[]
  price: number
  currency: string
  cabinClass: string
  seatsAvailable: number
  bookingClass: string
  outboundSegments: FlightSegment[]
  returnSegments?: FlightSegment[]
  raw: FlightOffer
}

// Search parameters
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'

export interface SearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  children?: number
  infants?: number
  cabinClass: CabinClass
  nonStop?: boolean
  maxPrice?: number
}

// Filter state
export interface FilterState {
  airlines: string[]
  stops: number | null // null means all, 0 = non-stop, 1 = 1 stop, 2 = 2+ stops
  priceRange: [number, number]
  departureTimeRange: [number, number] // hours 0-24
  cabinClasses: CabinClass[]
}

// Sort state
export type SortField = 'price' | 'duration' | 'departure' | 'arrival' | 'stops'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

// Pagination state
export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

// Airport for autocomplete
export interface Airport {
  iataCode: string
  name: string
  cityName: string
  countryCode: string
  countryName: string
  address?: {
    cityName: string
    cityCode: string
    countryName: string
    countryCode: string
  }
}

// API response types
export interface AmadeusTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AmadeusFlightResponse {
  data: FlightOffer[]
  dictionaries?: {
    carriers?: Record<string, string>
    aircraft?: Record<string, string>
    currencies?: Record<string, string>
    locations?: Record<string, { cityCode: string; countryCode: string }>
  }
  meta?: {
    count: number
    links?: {
      self: string
    }
  }
}

export interface AmadeusLocationResponse {
  data: Array<{
    type: string
    subType: string
    name: string
    detailedName: string
    id: string
    iataCode: string
    address: {
      cityName: string
      cityCode: string
      countryName: string
      countryCode: string
    }
  }>
}

// Chart data types
export interface PriceDataPoint {
  price: number
  count: number
  airline?: string
}

export interface PriceTrendPoint {
  time: string
  price: number
  airline: string
}

// Table column configuration
export interface TableColumnConfig {
  id: string
  visible: boolean
  order: number
  width?: number
}

// Recent search
export interface RecentSearch {
  id: string
  params: SearchParams
  timestamp: number
  resultCount?: number
}

// API Error
export interface ApiError {
  code: string
  title: string
  detail: string
  status: number
}
