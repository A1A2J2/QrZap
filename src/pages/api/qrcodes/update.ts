import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, original_url } = req.body as { id?: string; original_url?: string }

  if (!id || !original_url) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/qr_codes?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ original_url, updated_at: new Date().toISOString() })
    })

    if (!response.ok) {
      const errorData = (await response.json()) as { message?: string }
      return res.status(400).json({ error: errorData?.message || 'Failed to update QR code' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return res.status(500).json({ error: errorMessage })
  }
}