import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    // Direct call to Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server not configured' })
    }

    // Clean URL: remove trailing slashes and /rest/v1 if accidentally included
    const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')

    const response = await fetch(`${baseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        email,
        password,
        data: {}
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json({ error: data.error_description || data.message || data.error || 'Signup failed' })
    }

    return res.status(200).json({ message: 'Check your email to confirm signup' })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}