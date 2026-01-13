
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { useEffect } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW Registered', reg))
          .catch(err => console.error('SW Failed', err))
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#ff0050', 
                    colorBgContainer: '#1a1a1a',
                },
            }}
        >
            {children}
        </ConfigProvider>
      </AntdRegistry>
    </QueryClientProvider>
  )
}
