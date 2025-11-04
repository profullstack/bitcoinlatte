import { NextRequest, NextResponse } from 'next/server'

const VALUESERP_API_KEY = process.env.VALUESERP_API_KEY

/**
 * Search for business names using ValueSerp API
 * This endpoint is specifically for autocomplete suggestions of business names
 */
async function searchBusinessNames(query: string) {
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
 * Transform ValueSerp results to simplified format for name suggestions
 */
function transformBusinessResults(valueSerpData: any) {
  const places = valueSerpData.local_results || []
  
  return places.map((place: any) => ({
    name: place.title || place.name,
    address: place.address || `${place.city || ''}, ${place.state || ''}`.trim(),
    rating: place.rating,
    reviews: place.reviews,
    type: place.business_type,
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    if (!VALUESERP_API_KEY) {
      return NextResponse.json({ error: 'ValueSerp API key not configured' }, { status: 500 })
    }
    
    // Search for business names
    const valueSerpData = await searchBusinessNames(query)
    const results = transformBusinessResults(valueSerpData)
    
    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Business search API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}