import { NextResponse } from 'next/server'
import { LOGO_URL } from '@/utils/constants'
import { createClient } from '@supabase/supabase-js' // Use direct SDK for Admin
import webpush from 'web-push'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const privateKey = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || ''

if (!publicKey || !privateKey) {
    console.error("VAPID Keys are missing in environment variables!")
}

webpush.setVapidDetails(
  'mailto:aduwoayooluwa@gmail.com',
  publicKey,
  privateKey
)

export async function POST(request: Request) {
  try {
    const { userId, content, meta } = await request.json()

    // Capture IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Combine client meta with server-side info
    const fullMeta = { ...meta, ip, timestamp: new Date().toISOString() }
    
    // Use Service Role Key to bypass RLS so we can read the recipient's subscription
    // The sender (anonymous) doesn't have permission to see the recipient's sub.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. Please add it to .env.local")
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // 1. Insert message into database (Admin can always insert, or we can use the user client if we pref)
    // Actually, inserting messages is "public" allowed by RLS, so that was fine.
    // But fetching subscription was NOT.
    const { error: dbError } = await supabaseAdmin
      .from('messages')
      .insert({
        user_id: userId,
        content: content,
        meta: fullMeta
      })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // 2. Fetch the user's subscription
    const { data: subData, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .maybeSingle() 

    console.log(`[API] Fetching subscription for User ${userId}...`)

    if (subError) {
        console.error('[API] Subscription fetch error:', subError.message)
    }

    if (!subData?.subscription) {
      console.log('[API] No subscription found for this user.')
    } else {
      console.log('[API] Subscription found. Attempting to send push...')
      try {
        await webpush.sendNotification(
          subData.subscription,
          JSON.stringify({
            title: 'New Anonymous Message!',
            body: content,
            icon: LOGO_URL,
            badge: LOGO_URL
          })
        )
        console.log('[API] Push sent successfully!')
      } catch (pushError: any) {
        console.error('[API] Error sending push notification:', pushError)
        // Log the actual VAPID keys being used (partially) to verify
        // console.log('Public Key being used (start):', publicKey.substring(0, 5))
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
