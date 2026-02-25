import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/chat/dashboard — all sessions for the logged-in receiver
export async function GET() {
  try {
    // Auth check
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single efficient query:
    // - Only non-deleted sessions for this user
    // - For each session, fetch only the LATEST message via a limit+order on the relation
    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select(`
        id,
        secret_token,
        name,
        created_at,
        expires_at,
        last_message:chat_messages(id, sender_type, content, created_at)
      `)
      .eq('receiver_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .order('created_at', { ascending: false, foreignTable: 'chat_messages' })
      .limit(1, { foreignTable: 'chat_messages' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Minimal shaping — no JS sort needed anymore
    const shaped = (sessions || []).map((s: any) => ({
      id: s.id,
      secret_token: s.secret_token,
      name: s.name,
      created_at: s.created_at,
      expires_at: s.expires_at,
      lastMessage: s.last_message?.[0] ?? null,
    }))

    return NextResponse.json({ sessions: shaped })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
