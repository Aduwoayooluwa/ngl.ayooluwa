import React, { forwardRef } from 'react'

interface MessageShareCardProps {
  message: string
  username: string
}

export const MessageShareCard = forwardRef<HTMLDivElement, MessageShareCardProps>(({ message, username }, ref) => {
  return (
    <div 
        ref={ref}
        className="width-[1080px] height-[1920px] bg-gradient-to-bl from-[#ff0050] to-[#00f2ea] flex items-center justify-center relative overflow-hidden"
        style={{ width: '1080px', height: '1920px' }}
    >
        {/* Background Texture - Radial for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
        
        {/* Main Message Card */}
        <div className="bg-white rounded-[50px] p-12 w-[800px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative z-10 text-center flex flex-col items-center justify-center min-h-[400px]">
            
            <div className="uppercase tracking-widest text-[#ff0050] font-bold text-xl mb-6">
                Anonymous Message
            </div>

            <p className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 break-words w-full">
                {message}
            </p>
            
        </div>

        {/* Call to Action Pill */}
         <div className="absolute bottom-[30%] bg-black/20 backdrop-blur-md text-white px-8 py-4 rounded-full text-2xl font-bold border border-white/20 animate-pulse">
            Reply at ngl.aayooluwa/{username}
         </div>

        {/* Footer Branding */}
        <div className="absolute bottom-20 text-white text-3xl font-bold opacity-80">
            ngl<span className="text-black/50">.ayooluwa</span>
        </div>
    </div>
  )
})

MessageShareCard.displayName = 'MessageShareCard'
