import { NextRequest, NextResponse } from 'next/server'

// NOTE: Caching is currently disabled to ensure location-aware results
// TODO: Implement smart regional caching in the future

/**
 * Build Overpass QL query for cryptocurrency-accepting shops
 * @param bbox - Bounding box [south, west, north, east]
 * @returns Overpass QL query string
 */
function buildOverpassQuery(bbox: number[]): string {
  const [south, west, north, east] = bbox
  
  // Query for nodes and ways with cryptocurrency tags
  // Using union to get all crypto types in one query
  return `
    [out:json][timeout:25];
    (
      node["currency:XBT"="yes"](${south},${west},${north},${east});
      way["currency:XBT"="yes"](${south},${west},${north},${east});
      node["currency:BCH"="yes"](${south},${west},${north},${east});
      way["currency:BCH"="yes"](${south},${west},${north},${east});
      node["currency:LTC"="yes"](${south},${west},${north},${east});
      way["currency:LTC"="yes"](${south},${west},${north},${east});
      node["currency:XMR"="yes"](${south},${west},${north},${east});
      way["currency:XMR"="yes"](${south},${west},${north},${east});
    );
    out body;
    >;
    out skel qt;
  `.trim()
}

/**
 * Parse OSM element to extract shop information
 * @param element - OSM element (node or way)
 * @param wayNodes - Map of node IDs to coordinates (for ways)
 * @returns Parsed shop data or null
 */
function parseOsmElement(element: any, wayNodes: Map<number, [number, number]>): any | null {
  const tags = element.tags || {}
  
  // Determine which cryptocurrencies are accepted
  const cryptoAccepted: string[] = []
  if (tags['currency:XBT'] === 'yes') cryptoAccepted.push('BTC')
  if (tags['currency:BCH'] === 'yes') cryptoAccepted.push('BCH')
  if (tags['currency:LTC'] === 'yes') cryptoAccepted.push('LTC')
  if (tags['currency:XMR'] === 'yes') cryptoAccepted.push('XMR')
  
  // Skip if no crypto accepted (shouldn't happen with our query)
  if (cryptoAccepted.length === 0) return null
  
  // Get coordinates
  let lat: number | null = null
  let lon: number | null = null
  
  if (element.type === 'node') {
    lat = element.lat
    lon = element.lon
  } else if (element.type === 'way' && element.nodes && element.nodes.length > 0) {
    // For ways, use the center point (first node as approximation)
    const firstNodeId = element.nodes[0]
    const coords = wayNodes.get(firstNodeId)
    if (coords) {
      [lat, lon] = coords
    }
  }
  
  // Skip if no valid coordinates
  if (lat === null || lon === null) return null
  
  // Extract shop information
  const name = tags.name || tags['name:en'] || 'Unnamed Shop'
  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:postcode']
  ].filter(Boolean).join(', ') || 'Address not available'
  
  return {
    id: `osm-${element.type}-${element.id}`,
    osmId: element.id,
    osmType: element.type,
    name,
    address,
    latitude: lat,
    longitude: lon,
    crypto_accepted: cryptoAccepted,
    source: 'osm',
    // Additional metadata
    shop_type: tags.shop || tags.amenity || 'unknown',
    website: tags.website || null,
    phone: tags.phone || null,
    opening_hours: tags.opening_hours || null
  }
}

/**
 * Fetch cryptocurrency-accepting shops from OpenStreetMap
 * @param bbox - Bounding box [south, west, north, east]
 * @returns Array of shop data
 */
async function fetchOsmShops(bbox: number[]): Promise<any[]> {
  const query = buildOverpassQuery(bbox)
  const overpassUrl = 'https://overpass-api.de/api/interpreter'
  
  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    })
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Build a map of node IDs to coordinates for way processing
    const wayNodes = new Map<number, [number, number]>()
    data.elements?.forEach((element: any) => {
      if (element.type === 'node' && element.lat && element.lon) {
        wayNodes.set(element.id, [element.lat, element.lon])
      }
    })
    
    // Parse and filter elements
    const shops = data.elements
      ?.map((element: any) => parseOsmElement(element, wayNodes))
      .filter((shop: any) => shop !== null) || []
    
    return shops
  } catch (error) {
    console.error('Error fetching OSM data:', error)
    throw error
  }
}

/**
 * GET handler for OSM cryptocurrency shops
 * Query parameters:
 * - bbox: Bounding box as "south,west,north,east"
 * - force: Force refresh cache (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bboxParam = searchParams.get('bbox')
    
    console.log('[OSM API] Request received:', { bboxParam })
    
    // Validate bbox parameter
    if (!bboxParam) {
      console.error('[OSM API] Missing bbox parameter')
      return NextResponse.json(
        { error: 'Missing bbox parameter. Format: south,west,north,east' },
        { status: 400 }
      )
    }
    
    const bbox = bboxParam.split(',').map(Number)
    console.log('[OSM API] Parsed bbox:', bbox)
    
    if (bbox.length !== 4 || bbox.some(isNaN)) {
      console.error('[OSM API] Invalid bbox format:', bbox)
      return NextResponse.json(
        { error: 'Invalid bbox format. Expected: south,west,north,east (numbers)' },
        { status: 400 }
      )
    }
    
    // Fetch fresh data (caching disabled for now)
    console.log('[OSM API] Fetching shops for bbox:', bbox)
    const shops = await fetchOsmShops(bbox)
    console.log('[OSM API] Successfully fetched shops:', shops.length)
    
    return NextResponse.json({
      shops,
      cached: false,
      timestamp: Date.now(),
      count: shops.length
    })
  } catch (error) {
    console.error('[OSM API] Route error:', error)
    console.error('[OSM API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Failed to fetch OSM data',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}