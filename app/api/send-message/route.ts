import { NextResponse } from 'next/server'
import { LOGO_URL } from '@/utils/constants'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const privateKey = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || ''

if (!publicKey || !privateKey) {
  console.error('VAPID Keys are missing in environment variables!')
}

webpush.setVapidDetails('mailto:aduwoayooluwa@gmail.com', publicKey, privateKey)

export async function POST(request: Request) {
  try {
    const { userId, content, meta, senderSubscription, username } = await request.json()

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const fullMeta = { ...meta, ip, timestamp: new Date().toISOString() }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // 1. Insert message
    const { error: dbError } = await supabaseAdmin
      .from('messages')
      .insert({ user_id: userId, content, meta: fullMeta })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // 2. Fetch receiver's subscription
    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .maybeSingle()

    // 3. Fire both pushes in parallel — neither blocks the response
    const pushTasks: Promise<any>[] = []

    if (subData?.subscription) {
      pushTasks.push(
        webpush.sendNotification(
          subData.subscription,
          JSON.stringify({
            title: 'New anonymous message! 💬',
            body: String(content).slice(0, 80),
            icon: LOGO_URL,
            badge: LOGO_URL,
            url: '/dashboard',
          })
        ).catch(e => console.error('[send-message] Push to receiver failed:', e))
      )
    }

    if (senderSubscription) {
      pushTasks.push(
        webpush.sendNotification(
          senderSubscription,
          JSON.stringify({
            title: 'Message delivered! ✓',
            body: 'Your anonymous message was sent successfully.',
            icon: LOGO_URL,
            badge: LOGO_URL,
            url: username ? `/${username}` : '/',
          })
        ).catch(e => console.error('[send-message] Push to sender failed:', e))
      )
    }

    await Promise.allSettled(pushTasks)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
