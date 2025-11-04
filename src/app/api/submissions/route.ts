import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user is admin
    const { data: profile } = user ? await (supabase as any)
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() : { data: null }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const count = searchParams.get('count') === 'true'
    
    let query = supabase
      .from('submissions')
      .select('*, submission_images (*)', { count: count ? 'exact' : undefined })
      .order('created_at', { ascending: false })
    
    // Non-admins can only see their own submissions
    if (!profile?.is_admin) {
      if (user) {
        query = query.eq('submitted_by', user.id)
      } else {
        return NextResponse.json({ data: [] })
      }
    }
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count: totalCount } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Return count if requested
    if (count) {
      return NextResponse.json({ count: totalCount })
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    
    const { data, error } = await (supabase as any)
      .from('submissions')
      .insert({
        ...body,
        submitted_by: user?.id || null,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}