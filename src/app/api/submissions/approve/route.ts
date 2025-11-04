import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceRoleClient = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { submissionId, action, notes } = await request.json()
    
    if (action === 'approve') {
      // Get submission data
      const { data: submission, error: fetchError } = await (supabase as any)
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single()
      
      if (fetchError || !submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      
      // Create shop from submission using service role client to bypass RLS
      console.log('[APPROVE] About to insert shop with data:', {
        name: submission.name,
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        crypto_accepted: submission.crypto_accepted,
        approved: true,
        submitted_by: submission.submitted_by,
        approved_by: user.id
      })
      
      const { data: shop, error: shopError } = await (serviceRoleClient as any)
        .from('shops')
        .insert({
          name: submission.name,
          description: submission.description,
          address: submission.address,
          latitude: submission.latitude,
          longitude: submission.longitude,
          crypto_accepted: submission.crypto_accepted,
          website: submission.website,
          phone: submission.phone,
          hours: submission.hours,
          approved: true,
          submitted_by: submission.submitted_by,
          approved_by: user.id
        })
        .select()
        .single()
      
      console.log('[APPROVE] Shop insert result:', { shop, shopError })
      
      if (shopError) {
        console.error('[APPROVE] Failed to create shop:', shopError)
        console.error('[APPROVE] Error details:', {
          message: shopError.message,
          details: shopError.details,
          hint: shopError.hint,
          code: shopError.code
        })
        return NextResponse.json({
          error: shopError.message,
          details: shopError.details,
          hint: shopError.hint
        }, { status: 500 })
      }
      
      console.log('[APPROVE] Successfully created shop:', shop.id)
      
      // Copy images from submission to shop using service role client
      const { data: submissionImages } = await (serviceRoleClient as any)
        .from('submission_images')
        .select('*')
        .eq('submission_id', submissionId)
      
      if (submissionImages && submissionImages.length > 0) {
        const shopImages = submissionImages.map((img: any, index: number) => ({
          shop_id: shop.id,
          image_url: img.image_url,
          thumbnail_url: img.image_url, // TODO: Generate actual thumbnail
          is_primary: index === 0,
          uploaded_by: submission.submitted_by
        }))
        
        await (serviceRoleClient as any).from('shop_images').insert(shopImages)
      }
      
      // Update submission status
      const { data: updatedSubmission, error: updateError } = await (supabase as any)
        .from('submissions')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', submissionId)
        .select()
      
      if (updateError) {
        console.error('Failed to update submission status:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      // Verify that the update actually affected a row
      if (!updatedSubmission || updatedSubmission.length === 0) {
        console.error('Update succeeded but no rows were affected. Possible RLS policy issue.')
        return NextResponse.json({
          error: 'Failed to update submission status. This may be a permissions issue.'
        }, { status: 500 })
      }
      
      console.log('Successfully approved submission:', submissionId)
      return NextResponse.json({ data: shop })
    } else if (action === 'reject') {
      // First verify the submission exists and can be accessed
      const { data: submission, error: fetchError } = await (supabase as any)
        .from('submissions')
        .select('id, status')
        .eq('id', submissionId)
        .single()
      
      if (fetchError || !submission) {
        console.error('Failed to fetch submission for rejection:', fetchError)
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      
      // Update submission status to rejected
      const { data: updatedData, error: updateError } = await (supabase as any)
        .from('submissions')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', submissionId)
        .select()
      
      if (updateError) {
        console.error('Failed to update submission status:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      // Verify that the update actually affected a row
      if (!updatedData || updatedData.length === 0) {
        console.error('Update succeeded but no rows were affected. Possible RLS policy issue.')
        return NextResponse.json({
          error: 'Failed to update submission. This may be a permissions issue.'
        }, { status: 500 })
      }
      
      console.log('Successfully rejected submission:', submissionId)
      return NextResponse.json({ success: true, data: updatedData[0] })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[APPROVE] Unexpected error in approval process:', error)
    console.error('[APPROVE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}