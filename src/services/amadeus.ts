import type {
  AmadeusTokenResponse,
  AmadeusFlightResponse,
  AmadeusLocationResponse,
  SearchParams,
  Flight,
  Airport,
  FlightOffer,
} from '@/types'
import {
  AMADEUS_AUTH_URL,
  AMADEUS_FLIGHTS_URL,
  AMADEUS_LOCATIONS_URL,
  AIRLINE_NAMES,
} from '@/utils/constants'
import { formatDuration } from '@/utils/formatters'

// Token cache
let tokenCache: {
  token: string
  expiresAt: number
} | null = null

/**
 * Get Amadeus API access token
 */
async function getAccessToken(): Promise<string> {
  // Check cache
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const apiKey = import.meta.env.VITE_AMADEUS_API_KEY
  const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured. Please set VITE_AMADEUS_API_KEY and VITE_AMADEUS_API_SECRET in your .env file.')
  }

  const response = await fetch(AMADEUS_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Failed to authenticate with Amadeus API')
  }

  const data: AmadeusTokenResponse = await response.json()
  
  // Cache token (with 60 second buffer before expiry)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

/**
 * Transform Amadeus flight offer to internal Flight type
 */
function transformFlightOffer(
  offer: FlightOffer,
  carriers: Record<string, string> = {}
): Flight {
  const outbound = offer.itineraries[0]
  const firstSegment = outbound.segments[0]
  const lastSegment = outbound.segments[outbound.segments.length - 1]
  const airlineCode = offer.validatingAirlineCodes[0] || firstSegment.carrierCode

  // Get stop locations
  const stopLocations = outbound.segments.slice(0, -1).map((seg) => seg.arrival.iataCode)

  // Get cabin class from first traveler pricing
  const cabinClass = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY'

  return {
    id: offer.id,
    airline: airlineCode,
    airlineCode,
    airlineName: carriers[airlineCode] || AIRLINE_NAMES[airlineCode] || airlineCode,
    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
    origin: firstSegment.departure.iataCode,
    destination: lastSegment.arrival.iataCode,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: formatDuration(outbound.duration),
    stops: outbound.segments.length - 1,
    stopLocations,
    price: parseFloat(offer.price.grandTotal),
    currency: offer.price.currency,
    cabinClass,
    seatsAvailable: offer.numberOfBookableSeats,
    bookingClass: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.class || '',
    outboundSegments: outbound.segments,
    returnSegments: offer.itineraries[1]?.segments,
    raw: offer,
  }
}

/**
 * Search for flights
 */
export async function searchFlights(params: SearchParams): Promise<{
  flights: Flight[]
  total: number
}> {
  const token = await getAccessToken()

  const searchParams = new URLSearchParams({
    originLocationCode: params.origin.toUpperCase(),
    destinationLocationCode: params.destination.toUpperCase(),
    departureDate: params.departureDate,
    adults: params.adults.toString(),
    currencyCode: 'USD',
    max: '50',
  })

  if (params.returnDate) {
    searchParams.set('returnDate', params.returnDate)
  }

  if (params.cabinClass) {
    searchParams.set('travelClass', params.cabinClass)
  }

  if (params.nonStop) {
    searchParams.set('nonStop', 'true')
  }

  if (params.maxPrice) {
    searchParams.set('maxPrice', params.maxPrice.toString())
  }

  const response = await fetch(`${AMADEUS_FLIGHTS_URL}?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    const message = error.errors?.[0]?.detail || 'Failed to search flights'
    throw new Error(message)
  }

  const data: AmadeusFlightResponse = await response.json()
  const carriers = data.dictionaries?.carriers || {}

  const flights = data.data.map((offer) => transformFlightOffer(offer, carriers))

  return {
    flights,
    total: data.meta?.count || flights.length,
  }
}

/**
 * Search for airport/city locations
 */
export async function searchLocations(keyword: string): Promise<Airport[]> {
  if (keyword.length < 2) return []

  const token = await getAccessToken()

  const searchParams = new URLSearchParams({
    keyword: keyword.toUpperCase(),
    subType: 'AIRPORT,CITY',
    'page[limit]': '10',
  })

  const response = await fetch(`${AMADEUS_LOCATIONS_URL}?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    console.error('Location search failed')
    return []
  }

  const data: AmadeusLocationResponse = await response.json()

  return data.data.map((location) => ({
    iataCode: location.iataCode,
    name: location.name,
    cityName: location.address?.cityName || '',
    countryCode: location.address?.countryCode || '',
    countryName: location.address?.countryName || '',
    address: location.address,
  }))
}

/**
 * Get Amadeus API configuration status
 */
export function isAmadeusConfigured(): boolean {
  return !!(import.meta.env.VITE_AMADEUS_API_KEY && import.meta.env.VITE_AMADEUS_API_SECRET)
}
