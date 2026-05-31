import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { UAParser } from 'ua-parser-js';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.params || {};

  if (typeof code !== 'string') {
    return { notFound: true };
  }

  // Use the server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name];
        },
      },
    }
  );

  // 1. Find the QR code by its short_code directly from the table
  const { data: qrCode, error: qrError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('short_code', code)
    .single();

  if (qrError || !qrCode) {
    console.error(`QR code not found for short_code: ${code}`, qrError);
    return { notFound: true };
  }

  // 2. Gather analytics data from the request headers
  const userAgent = context.req.headers['user-agent'] || '';
  // Vercel provides the visitor's country code in this header.
  // For local development, this will be 'Unknown'.
  const country = (context.req.headers['x-vercel-ip-country'] as string) || 'Unknown';

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const deviceType = device.type || 'desktop'; // e.g., 'mobile', 'tablet', 'desktop'

  // 3. Log the click event with the new analytics data
  const { error: clickError } = await supabase.from('qr_clicks').insert({
    qr_code_id: qrCode.id,
    user_agent: userAgent,
    referer: context.req.headers.referer || null,
    country: country,
    device_type: deviceType,
  });

  if (clickError) {
    console.error('Error logging click:', clickError);
    // We won't block the redirect if logging fails, but we log the error.
  }

  // 4. Increment the main click_count on the qr_codes table directly
  const { error: updateError } = await supabase
    .from('qr_codes')
    .update({ click_count: (qrCode.click_count || 0) + 1 })
    .eq('id', qrCode.id);

  if (updateError) {
    console.error('Error incrementing click count:', updateError);
  }

  // 5. Redirect the user to the original URL
  return {
    redirect: {
      destination: qrCode.original_url,
      permanent: false, // Use a temporary redirect
    },
  };
};

// This page component is never actually rendered because we always redirect
// in getServerSideProps. It's just here to make the file a valid Next.js page.
export default function QrRedirectPage() {
  return null;
}
