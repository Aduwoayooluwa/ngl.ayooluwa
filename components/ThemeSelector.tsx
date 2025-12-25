'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, Palette } from 'lucide-react'
import { THEMES } from '@/utils/constants'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSelect = async (themeKey: string) => {
    if (themeKey === currentTheme) return
    
    // Optimistic Update
    const previousTheme = currentTheme
    onThemeChange(themeKey)
    
    const { error } = await supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return { error: 'No user' }
        return supabase.from('profiles').update({ theme: themeKey }).eq('id', data.user.id)
    })

    if (error) {
        // Revert on failure
        console.error("Failed to update theme", error)
        onThemeChange(previousTheme)
    }
  }

  return (
    <Card variant="default" className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold">
            <Palette className="text-brand-secondary" />
            <h3>Customize Theme</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(THEMES).map(([key, theme]) => (
                <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={loading}
                    className={`relative rounded-xl overflow-hidden h-24 border-2 transition-all ${currentTheme === key ? 'border-brand-primary scale-105 shadow-lg shadow-brand-primary/20' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                >
                    <div className={`absolute inset-0 ${theme.bg}`} />
                    <div className="absolute inset-0" style={{ background: theme.gradient, opacity: 0.6 }} />
                    
                    <div className="absolute bottom-0 left-0 w-full p-2 text-xs font-bold text-white bg-black/40 backdrop-blur-sm text-center">
                        {theme.name}
                    </div>

                    {currentTheme === key && (
                        <div className="absolute top-2 right-2 bg-brand-primary rounded-full p-1 text-white">
                            <Check size={12} />
                        </div>
                    )}
                </button>
            ))}
        </div>
    </Card>
  )
}
