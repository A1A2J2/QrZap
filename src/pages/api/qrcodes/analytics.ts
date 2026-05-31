import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Use service role to bypass RLS policies if needed for analytics
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Fetch QR codes for this user
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (qrError) throw qrError
    if (!qrCodes || qrCodes.length === 0) return res.status(200).json([])

    // 2. Fetch clicks for the last 48 hours to safely cover any global timezone differences
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const { data: clicks, error: clicksError } = await supabase
      .from('qr_clicks')
      .select('qr_code_id, clicked_at')
      .in('qr_code_id', qrCodes.map(q => q.id))
      .gte('clicked_at', twoDaysAgo.toISOString())

    if (clicksError) throw clicksError

    // 3. Group raw click timestamps by QR code to let the frontend calculate local timezones
    const enrichedQrCodes = qrCodes.map(qr => {
      return {
        ...qr,
        raw_clicks: clicks.filter(c => c.qr_code_id === qr.id).map(c => c.clicked_at)
      }
    })

    res.status(200).json(enrichedQrCodes)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
