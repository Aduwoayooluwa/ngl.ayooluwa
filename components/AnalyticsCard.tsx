'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BarChart3, TrendingUp, Dices } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function AnalyticsCard() {
  const [stats, setStats] = useState({ views: 0, rolls: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get Start of Day (UTC? or Local? Let's generic to last 24h or strict today per UTC)
      // For simplicity in SQL/Supabase, let's just count ALL time or recent?
      // User asked for "Views Today".
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Parallel fetch
      const [views, rolls] = await Promise.all([
        supabase.from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('event_type', 'page_view')
            .gte('created_at', today.toISOString()),
        supabase.from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('event_type', 'dice_roll')
            .gte('created_at', today.toISOString())
      ])

      setStats({
        views: views.count || 0,
        rolls: rolls.count || 0
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
        <Card variant="strong" className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <BarChart3 size={16} className="text-brand-primary" />
                Views Today
            </div>
            {loading ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
                <div className="text-3xl font-black text-white">{stats.views}</div>
            )}
        </Card>

        <Card variant="strong" className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <Dices size={16} className="text-brand-secondary" />
                Dice Rolls
            </div>
             {loading ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
                <div className="text-3xl font-black text-white">{stats.rolls}</div>
            )}
        </Card>
    </div>
  )
}
