import React, { forwardRef } from 'react'

interface IGShareCardProps {
  username: string
}

export const IGShareCard = forwardRef<HTMLDivElement, IGShareCardProps>(({ username }, ref) => {
  return (
    <div 
        ref={ref}
        className="width-[1080px] height-[1920px] bg-gradient-to-br from-[#ff0050] to-[#00f2ea] flex items-center justify-center relative overflow-hidden"
        style={{ width: '1080px', height: '1920px' }} // Fixed resolution for high quality IG Story
    >
        {/* Background Texture/Noise */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        
        {/* Main Card */}
        <div className="bg-white rounded-[60px] p-16 w-[800px] shadow-2xl relative z-10 text-center space-y-8 transform -rotate-2">
            
            {/* Avatar/Header */}
            <div className="flex justify-center">
                 <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#ff0050] to-[#00f2ea] p-1">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff0050] to-[#00f2ea]">
                            {username.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                 </div>
            </div>

            <h1 className="text-6xl font-black text-gray-900 tracking-tighter">
                Send me anonymous <br/> messages!
            </h1>
            
            <div className="pt-4  px-10">
                <div className="bg-gray-100 rounded-full py-6 px-10 text-3xl font-bold text-gray-500 font-mono">
                    ngl.ayooluwa/{username}
                </div>
            </div>

             <div className="text-2xl text-gray-400 font-medium pt-4">
                ( I won't know who sent it )
            </div>
        </div>

        {/* Footer Branding */}
        <div className="absolute bottom-20 text-white text-3xl font-bold opacity-80">
            ngl<span className="text-black/50">.ayooluwa</span>
        </div>
    </div>
  )
})

IGShareCard.displayName = 'IGShareCard'
