import React, { useState, useRef, useEffect } from 'react';
import { usePocketGuide } from './PocketGuideContext';
import PocketGuideAvatar from './PocketGuideAvatar';

const PocketGuideDock: React.FC = () => {
  const { state, message, isMuted, toggleMute, setHidden, trigger } = usePocketGuide();
  
  // Draggable State
  const [position, setPosition] = useState({ x: 20, y: typeof window !== 'undefined' ? window.innerHeight - 150 : 500 });
  const [isDragging, setIsDragging] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the main container or avatar, not the buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  // Global Mouse Move/Up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Boundary Check (roughly)
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Click Handler for Bubble (Inject Command)
  const handleBubbleClick = () => {
      if (message && !isDragging) {
          trigger('FOCUS_INPUT', `Ejecutando sugerencia: ${message.text.substring(0, 20)}...`);
          // Note: In a real app, we might want to pass a specific callback to inject text into the main Chat input.
          // For now, we trigger the Assistant to confirm receipt.
      }
  };

  if (state === 'hidden') {
    return (
        <button 
            onClick={() => { setHidden(false); trigger('NAVIGATE', "Sistemas online."); }}
            className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-xl bg-deep/90 border border-white/20 flex items-center justify-center text-xs text-accent-secondary shadow-glass hover:scale-110 transition-transform animate-pulse-slow group"
            title="Despertar Unidad"
        >
            <span className="group-hover:animate-spin">❖</span>
        </button>
    );
  }

  return (
    <div 
        ref={dockRef}
        className="fixed z-50 flex items-end gap-4"
        style={{ 
            left: position.x, 
            top: position.y,
            touchAction: 'none' // Prevent scrolling on touch devices while dragging
        }}
        onMouseDown={handleMouseDown}
    >
      
      {/* 1. Avatar Character */}
      <div className="relative shrink-0">
          <PocketGuideAvatar 
            state={state} 
            onClick={() => !isDragging && trigger('GIVE_HINT')} 
            isDragging={isDragging}
          />
          
          {/* Quick Action Buttons (Orbiting the avatar) - Hide when dragging for cleaner look */}
          <div className={`absolute -right-12 bottom-0 flex flex-col gap-2 transition-opacity duration-200 ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); trigger('GIVE_HINT'); }}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:border-accent-personal hover:text-accent-personal hover:bg-white/10 text-gray-400 flex items-center justify-center transition-all shadow-glass"
                title="Sugerencia / Idea"
              >
                  💡
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:border-accent-secondary hover:text-accent-secondary hover:bg-white/10 text-gray-400 flex items-center justify-center transition-all shadow-glass"
                title={isMuted ? "Activar Sonido" : "Silenciar"}
              >
                  {isMuted ? '🔇' : '🔊'}
              </button>
               <button 
                onClick={(e) => { e.stopPropagation(); setHidden(true); }}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/10 hover:border-status-hard hover:text-status-hard hover:bg-white/10 text-gray-400 flex items-center justify-center transition-all shadow-glass"
                title="Ocultar"
              >
                  ✕
              </button>
          </div>
      </div>

      {/* 2. Dialogue Box (RPG Style) */}
      {message && !isDragging && (
        <div 
            className="absolute left-full bottom-full ml-2 mb-2 w-[220px] md:w-[300px] animate-slide-up-fade origin-bottom-left cursor-pointer group"
            onClick={handleBubbleClick}
        >
            <div className="relative bg-deep/95 border-2 border-white/20 backdrop-blur-xl p-4 rounded-xl rounded-bl-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-accent-secondary/50 transition-colors">
                
                {/* Decorative header line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-secondary via-transparent to-transparent opacity-50"></div>
                
                <h4 className="text-[9px] font-mono tracking-widest text-accent-secondary mb-1 uppercase opacity-70 flex justify-between">
                    <span>{state === 'speaking' ? 'TRANSMISIÓN...' : 'SYSTEM LOG'}</span>
                    <span className="text-[8px] opacity-50 group-hover:opacity-100 transition-opacity">CLICK TO INSERT</span>
                </h4>
                
                <p className="font-mono text-xs md:text-sm text-gray-100 leading-relaxed drop-shadow-md select-none">
                    {message.text}
                </p>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20"></div>
            </div>
        </div>
      )}

    </div>
  );
};

export default PocketGuideDock;