import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Admin Client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId, eventType } = await request.json()

    if (!userId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('analytics')
      .insert({
        user_id: userId,
        event_type: eventType
      })

    if (error) {
      console.error('Analytics Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
