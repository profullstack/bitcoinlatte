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
  
  return <HomeClient shops={shops || []} />
}
