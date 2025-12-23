
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only submit letters, numbers, and underscores.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
            username: username.toLowerCase()
        }
      },
    })


    if (error) {
      setError(error.message)
    } else {
      // In a real app, you might ask for email confirmation.
      // For this demo, let's assume they might be auto-signed in or directed to check email.
      // Supabase default is "Confirm Email".
      setError("Check your email for the confirmation link!")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/bg-gradient.svg')] bg-cover">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
      
      <Card className="w-full max-w-md relative z-10" hoverEffect>
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white mb-2 tracking-tighter"
          >
            ngl<span className="text-brand-primary">.ayooluwa</span>
          </motion.h1>
          <p className="text-gray-400">Get anonymous messages on Instagram.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="username"
            minLength={3}
            maxLength={20}
          />
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

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`text-sm text-center p-2 rounded ${error.includes('Check') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:text-brand-primary transition-colors">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}
