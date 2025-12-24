
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Toast from '@/components/ui/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' as 'success' | 'error' })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      showToast(error.message, 'error')
      setLoading(false)
    } else {
      showToast('Welcome back!', 'success')
      // Small delay to let the toast be seen before redirect
      setTimeout(() => {
          router.push('/dashboard')
      }, 1000)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-3 md:p-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md relative z-10" hoverEffect>
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter"
          >
            Welcome Back
          </motion.h1>
          <p className="text-gray-400">Login to view your anonymous messages.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Toast 
            message={toast.message}
            isVisible={toast.isVisible}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-white hover:text-brand-primary transition-colors">
            Get Started
          </Link>
        </div>
      </Card>
    </div>
  )
}
