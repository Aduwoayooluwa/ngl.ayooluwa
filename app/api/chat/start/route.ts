import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { LOGO_URL } from '@/utils/constants'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  'mailto:aduwoayooluwa@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const { receiverUsername, firstMessage, senderPushSubscription } = await request.json()

    if (!receiverUsername || !firstMessage?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Resolve username → receiver profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', receiverUsername)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Create chat session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        receiver_id: profile.id,
        sender_push_subscription: senderPushSubscription || null,
      })
      .select('id, secret_token')
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // 3. Insert first message
    const { error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_type: 'anonymous',
        content: firstMessage.trim(),
      })

    if (msgError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // 4. Notify receiver via push
    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .select('subscription')
      .eq('user_id', profile.id)
      .maybeSingle()

    if (subData?.subscription) {
      try {
        await webpush.sendNotification(
          subData.subscription,
          JSON.stringify({
            title: 'New Anonymous Chat!',
            body: firstMessage.trim().slice(0, 80),
            icon: LOGO_URL,
          })
        )
      } catch (e) {
        console.error('[chat/start] Push to receiver failed:', e)
      }
    }

    return NextResponse.json({ token: session.secret_token })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
