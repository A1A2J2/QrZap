import { supabase } from './supabase'

export async function getUserTier(userId: string) {
  const { data, error } = await supabase
    .from('user_metadata')
    .select('tier')
    .eq('id', userId)
    .single()

  const tier = data?.tier || 'free'
  
  // Count actual QR codes dynamically to guarantee 100% accuracy
  const { count } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return { tier, qr_code_count: count || 0 }
}

export async function canGenerateQR(userId: string) {
  const { tier, qr_code_count } = await getUserTier(userId)
  
  // Free tier: max 10 QR codes
  if (tier === 'free' && (qr_code_count || 0) >= 10) {
    return { allowed: false, reason: 'free_tier_limit' }
  }
  
  // Premium tier: unlimited
  return { allowed: true }
}

export async function incrementQRCount(userId: string) {
  // No longer needed! We dynamically count the QR codes directly from the database now.
}
