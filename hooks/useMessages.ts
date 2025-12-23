
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Message } from '@/types'

export const useMessages = () => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['messages'],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Message[]
    },
  })
}
