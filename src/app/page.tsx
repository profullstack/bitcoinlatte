import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch approved shops
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user profile to check admin status
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    isAdmin = profile?.is_admin || false
  }
  
  return <HomeClient shops={shops || []} user={user} isAdmin={isAdmin} />
}
