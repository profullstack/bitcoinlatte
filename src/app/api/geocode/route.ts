import { NextRequest, NextResponse } from 'next/server'

const HERE_API_KEY = process.env.HERE_API_KEY
const VALUESERP_API_KEY = process.env.VALUESERP_API_KEY

/**
 * Search for places using ValueSerp Google Local API
 */
async function searchWithValueSerp(query: string) {
  if (!VALUESERP_API_KEY) {
    throw new Error('ValueSerp API key not configured')
  }

  const url = new URL('https://api.valueserp.com/search')
  url.searchParams.set('api_key', VALUESERP_API_KEY)
  url.searchParams.set('q', query)
  url.searchParams.set('location', 'United States')
  url.searchParams.set('google_domain', 'google.com')
  url.searchParams.set('gl', 'us')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('num', '5')
  url.searchParams.set('output', 'json')

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`ValueSerp API error: ${response.status}`)
  }

  return await response.json()
}

/**
 * Enrich place data with HERE.com geocoding
 */
async function enrichWithHere(address: string) {
  if (!HERE_API_KEY) {
    return null
  }

  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${HERE_API_KEY}&limit=1`
  
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data = await response.json()
    return data.items?.[0] || null
  } catch (error) {
    console.error('HERE.com enrichment error:', error)
    return null
  }
}

/**
 * Get autocomplete suggestions using HERE.com
 */
async function getHereAutosuggest(query: string) {
  if (!HERE_API_KEY) {
    throw new Error('HERE API key not configured')
  }

  // Use a default center point (San Francisco) for autosuggest
  // This can be made dynamic based on user location in the future
  const defaultLat = 37.7749
  const defaultLng = -122.4194
  
  const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&at=${defaultLat},${defaultLng}&apiKey=${HERE_API_KEY}&limit=5`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HERE API error: ${response.status}`)
  }

  return await response.json()
}

/**
 * Geocode a full address using HERE.com
 */
async function geocodeWithHere(address: string) {
  if (!HERE_API_KEY) {
    throw new Error('HERE API key not configured')
  }

  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${HERE_API_KEY}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HERE API error: ${response.status}`)
  }

  return await response.json()
}

/**
 * Transform ValueSerp results to match expected format
 */
function transformValueSerpResults(valueSerpData: any) {
  const places = valueSerpData.local_results?.places || []
  
  return places.map((place: any) => ({
    title: place.title || place.name,
    address: {
      label: place.address || `${place.title}, ${place.city || ''}, ${place.state || ''}`.trim(),
    },
    position: place.gps_coordinates ? {
      lat: place.gps_coordinates.latitude,
      lng: place.gps_coordinates.longitude,
    } : null,
    resultType: 'place',
    localityType: 'city',
    // Additional metadata from ValueSerp
    metadata: {
      rating: place.rating,
      reviews: place.reviews,
      type: place.type,
      phone: place.phone,
      website: place.website,
      hours: place.hours,
    }
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'autosuggest'
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }
    
    let data: any
    
    if (type === 'autosuggest') {
      // Try ValueSerp first for better business results
      if (VALUESERP_API_KEY) {
        try {
          const valueSerpData = await searchWithValueSerp(query)
          const transformedResults = transformValueSerpResults(valueSerpData)
          
          // If we got good results from ValueSerp, use them
          if (transformedResults.length > 0) {
            // Enrich with HERE.com data if available
            const enrichedResults = await Promise.all(
              transformedResults.map(async (result: any) => {
                if (!result.position && result.address?.label) {
                  const hereData = await enrichWithHere(result.address.label)
                  if (hereData?.position) {
                    result.position = hereData.position
                  }
                }
                return result
              })
            )
            
            data = { items: enrichedResults }
          } else {
            // Fallback to HERE.com if ValueSerp didn't return results
            data = await getHereAutosuggest(query)
          }
        } catch (error) {
          console.error('ValueSerp error, falling back to HERE.com:', error)
          // Fallback to HERE.com
          data = await getHereAutosuggest(query)
        }
      } else {
        // No ValueSerp key, use HERE.com only
        data = await getHereAutosuggest(query)
      }
    } else if (type === 'geocode') {
      // Full geocoding - use HERE.com
      data = await geocodeWithHere(query)
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Geocode API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}