import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { short_code, user_agent, referer } = req.body

  if (!short_code) {
    return res.status(400).json({ error: 'Missing short code' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Use the service role key to bypass RLS for inserting and updating analytics
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Look up the QR code in database
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, original_url, click_count')
      .eq('short_code', short_code)
      .single()

    if (fetchError || !qrCode) {
      return res.status(404).json({ error: 'QR code not found' })
    }

    const userAgent = user_agent || req.headers['user-agent'] || 'Unknown'
    const refererHeader = referer || req.headers.referer || 'Direct'

    // 2. Records click details in qr_clicks table
    const { error: clickError } = await supabase
      .from('qr_clicks')
      .insert([
        {
          qr_code_id: qrCode.id,
          user_agent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
          referer: Array.isArray(refererHeader) ? refererHeader[0] : refererHeader
        }
      ])

    if (clickError) {
      console.error('Error logging click:', clickError)
    }

    // 3. Updates click_count in qr_codes table
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ click_count: (qrCode.click_count || 0) + 1 })
      .eq('id', qrCode.id)

    if (updateError) {
      console.error('Error updating click count:', updateError)
    }

    return res.status(200).json({ 
      success: true, 
      original_url: qrCode.original_url 
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}