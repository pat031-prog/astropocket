import React, { useEffect, useState } from 'react';
import { GuideState } from './types';

interface AvatarProps {
  state: GuideState;
  onClick: () => void;
  isDragging?: boolean;
}

const PocketGuideAvatar: React.FC<AvatarProps> = ({ state, onClick, isDragging = false }) => {
  const [blink, setBlink] = useState(false);
  const [glance, setGlance] = useState<'left' | 'right' | 'center'>('center');

  // Random blink logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7 && state !== 'computing' && !isDragging) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, [state, isDragging]);

  // Random Glance Logic (Look around)
  useEffect(() => {
    const glanceInterval = setInterval(() => {
        if (state === 'idle' && !isDragging) {
            const roll = Math.random();
            if (roll < 0.3) setGlance('left');
            else if (roll > 0.7) setGlance('right');
            else setGlance('center');
            
            setTimeout(() => setGlance('center'), 1000);
        }
    }, 5000);
    return () => clearInterval(glanceInterval);
  }, [state, isDragging]);

  // Determine eye shape/color based on state
  const getEyeClass = () => {
    if (isDragging) return 'h-1 w-3 bg-white rotate-45'; // Dizzy/Surprised when dragged (> <)
    
    if (state === 'computing') return 'h-1 w-3 animate-spin bg-accent-primary'; // Spinning eyes
    if (state === 'warning') return 'h-1 w-3 rotate-45 bg-status-hard'; // Angry eyes
    if (state === 'listening') return 'h-4 w-4 rounded-full bg-accent-secondary animate-pulse'; // Wide eyes
    if (state === 'success') return 'h-2 w-4 rounded-t-full bg-status-soft'; // Happy eyes (inverted arch)
    if (blink) return 'h-[1px] w-3 bg-white scale-x-110'; // Blink
    
    // Glance logic implementation via translation
    return 'h-3 w-2 md:h-4 md:w-3 bg-white rounded-sm transition-transform duration-300'; 
  };

  // Glance Offset CSS
  const glanceStyle = isDragging ? {} : {
      transform: glance === 'left' ? 'translateX(-2px)' : glance === 'right' ? 'translateX(2px)' : 'none'
  };

  // Dragging eye rotation override for the second eye to create > < effect
  const rightEyeStyle = isDragging ? { transform: 'rotate(-45deg)' } : glanceStyle;
  const leftEyeStyle = isDragging ? { transform: 'rotate(45deg)' } : glanceStyle;

  const containerGlow = 
    isDragging ? 'shadow-[0_0_30px_rgba(255,255,255,0.4)] border-white scale-110' :
    state === 'computing' ? 'shadow-[0_0_20px_rgba(224,170,255,0.6)] border-accent-primary' :
    state === 'warning' ? 'shadow-[0_0_20px_rgba(239,83,80,0.6)] border-status-hard' :
    state === 'listening' ? 'shadow-[0_0_20px_rgba(78,168,222,0.6)] border-accent-secondary' :
    state === 'success' ? 'shadow-[0_0_20px_rgba(102,187,106,0.6)] border-status-soft' :
    'shadow-[0_0_10px_rgba(255,255,255,0.2)] border-white/20';

  return (
    <div 
        className={`
            relative w-16 h-16 md:w-20 md:h-20 bg-black/80 backdrop-blur-md rounded-2xl border-2 
            flex items-center justify-center cursor-pointer group transition-all duration-200
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab animate-float'}
            ${containerGlow}
        `}
        onClick={isDragging ? undefined : onClick}
        role="button"
        aria-label="Interact with Nova"
    >
        {/* Holographic Scanlines */}
        <div className="absolute inset-0 rounded-xl overflow-hidden opacity-30 pointer-events-none">
             <div className="w-full h-[200%] bg-gradient-to-b from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '100% 4px' }}></div>
        </div>

        {/* Antennas / Ears */}
        <div className={`absolute -top-3 left-2 w-1 h-3 bg-gray-500 transition-all ${state === 'listening' || isDragging ? '-translate-y-2 bg-accent-secondary' : ''}`}></div>
        <div className={`absolute -top-3 right-2 w-1 h-3 bg-gray-500 transition-all ${state === 'listening' || isDragging ? '-translate-y-2 bg-accent-secondary' : ''}`}></div>

        {/* Face Container */}
        <div className="relative z-10 flex gap-3 items-center justify-center w-full h-full">
            {/* Left Eye */}
            <div 
                className={`transition-all duration-200 ${getEyeClass()} shadow-[0_0_5px_currentColor]`}
                style={leftEyeStyle}
            ></div>
            {/* Right Eye */}
            <div 
                className={`transition-all duration-200 ${getEyeClass()} shadow-[0_0_5px_currentColor]`}
                style={rightEyeStyle}
            ></div>
            
            {/* Mouth (Optional small dot or line) */}
            {(state === 'speaking' || state === 'computing') && !isDragging && (
                <div className="absolute bottom-4 w-2 h-1 bg-white/50 animate-ping rounded-full"></div>
            )}
        </div>

        {/* Tech Decor */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            <div className={`w-1 h-1 rounded-full ${state === 'idle' ? 'bg-gray-700' : 'bg-green-500 animate-pulse'}`}></div>
            <div className="w-1 h-1 rounded-full bg-gray-700"></div>
            <div className="w-1 h-1 rounded-full bg-gray-700"></div>
        </div>

        {/* Floating Label when hovered */}
        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest text-white/50 transition-opacity whitespace-nowrap ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isDragging ? 'RELOCATING...' : 'UNIT-9'}
        </div>
    </div>
  );
};

export default PocketGuideAvatar;
