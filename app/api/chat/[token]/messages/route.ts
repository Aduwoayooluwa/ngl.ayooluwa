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

// GET /api/chat/[token]/messages
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Single query: session + all messages via join
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, is_deleted, expires_at, name, receiver_id, chat_messages(id, sender_type, content, created_at)')
      .eq('secret_token', token)
      .order('created_at', { foreignTable: 'chat_messages', ascending: true })
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    if (session.is_deleted) {
      return NextResponse.json({ error: 'Chat has expired' }, { status: 410 })
    }

    const messages = (session.chat_messages as any[]) || []

    return NextResponse.json({
      session: { id: session.id, name: session.name, expires_at: session.expires_at },
      messages,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/chat/[token]/messages  (send a message)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { content, senderType } = await request.json()
    const chatUrl = `/c/${token}`

    if (!content?.trim() || !senderType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, is_deleted, expires_at, receiver_id, sender_push_subscription')
      .eq('secret_token', token)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    if (session.is_deleted || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Chat has expired' }, { status: 410 })
    }

    // Insert message
    const { data: newMsg, error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: session.id,
        sender_type: senderType,
        content: content.trim(),
      })
      .select('id, sender_type, content, created_at')
      .single()

    if (msgError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Fire-and-forget push notifications — never block the response
    const pushTasks: Promise<any>[] = []

    if (senderType === 'anonymous') {
      // Notify the receiver (logged-in owner)
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('subscription')
        .eq('user_id', session.receiver_id)
        .maybeSingle()

      if (subData?.subscription) {
        pushTasks.push(
          webpush.sendNotification(
            subData.subscription,
            JSON.stringify({
              title: 'New message in your anonymous chat 💬',
              body: content.trim().slice(0, 80),
              icon: LOGO_URL,
              badge: LOGO_URL,
              url: '/dashboard',
            })
          ).catch(e => console.error('[chat/messages] Push to receiver failed:', e))
        )
      }
    } else if (senderType === 'owner' && session.sender_push_subscription) {
      // Notify the anonymous sender
      pushTasks.push(
        webpush.sendNotification(
          session.sender_push_subscription,
          JSON.stringify({
            title: 'They replied to your anonymous chat! 💬',
            body: content.trim().slice(0, 80),
            icon: LOGO_URL,
            badge: LOGO_URL,
            url: chatUrl,
          })
        ).catch(e => console.error('[chat/messages] Push to sender failed:', e))
      )
    }

    await Promise.allSettled(pushTasks)

    return NextResponse.json({ message: newMsg })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
