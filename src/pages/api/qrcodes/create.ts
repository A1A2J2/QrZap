import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const serializeOptions = Object.entries(options || {})
                .map(([k, v]) => `${k}=${v}`)
                .join('; ');
              res.appendHeader('Set-Cookie', `${name}=${value}; ${serializeOptions}`);
            });
          } catch {
            // Safe fallback if headers have already been sent
          }
        },
      },
    }
  );

  // Get the user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { original_url, short_code, qr_data } = req.body;

  if (!original_url || !short_code || !qr_data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id, // Use the secure user ID from the session
        original_url,
        short_code,
        qr_data,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving QR code:', error);
      return res.status(500).json({ error: `Database error: ${error.message}` });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API route error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
}
