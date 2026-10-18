import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GuideState, GuideAction, PocketGuideContextType, GuideMessage } from './types';
import { getNextState, getMessageForAction, shouldSpeak, resetCooldown } from './pocketGuideMachine';

const PocketGuideContext = createContext<PocketGuideContextType | undefined>(undefined);

export const PocketGuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GuideState>('idle');
  const [message, setMessage] = useState<GuideMessage | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load persistence on mount
  useEffect(() => {
    const hiddenPref = localStorage.getItem('astropocket_guide_hidden');
    const mutedPref = localStorage.getItem('astropocket_guide_muted');
    if (hiddenPref === '1') setIsHidden(true);
    if (mutedPref === '1') setIsMuted(true);
    
    // Initial Greeting if not hidden
    if (hiddenPref !== '1') {
        setTimeout(() => trigger('FOCUS_INPUT', "Sistema inicializado. Unidad lista."), 1000);
    }
  }, []);

  const trigger = (action: GuideAction, customText?: string) => {
    if (isHidden && action !== 'ERROR') return; 

    const nextState = getNextState(state, action);
    setState(nextState);

    // Determine duration based on text length
    const text = getMessageForAction(action, customText);
    const duration = text ? Math.max(4000, text.length * 60) : 4000;

    // Should we show a message?
    if (!isMuted && (customText || shouldSpeak(action) || action === 'GIVE_HINT')) {
      if (text) {
        setMessage({
          text,
          id: Date.now().toString(),
          duration
        });
        setState(action === 'GIVE_HINT' ? 'speaking' : 'speaking');

        // Clear existing message timer
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Auto dismiss message
        timerRef.current = setTimeout(() => {
          setMessage(null);
          // Return to idle unless computing
          setState(prev => prev === 'speaking' ? 'idle' : prev);
        }, duration);
      }
    }

    // Reset to idle after action (except computing which needs explicit success/end)
    if (action !== 'START_COMPUTE' && action !== 'ERROR') {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
             setState('idle');
        }, duration + 1000);
    }
  };

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem('astropocket_guide_muted', newVal ? '1' : '0');
    // Provide feedback
    if (!newVal) {
        resetCooldown();
        trigger('NAVIGATE', "Audio protocolos activados.");
    }
  };

  const setHiddenState = (val: boolean) => {
    setIsHidden(val);
    localStorage.setItem('astropocket_guide_hidden', val ? '1' : '0');
  };

  return (
    <PocketGuideContext.Provider value={{
      state: isHidden ? 'hidden' : state,
      message,
      isMuted,
      trigger,
      toggleMute,
      setHidden: setHiddenState
    }}>
      {children}
    </PocketGuideContext.Provider>
  );
};

export const usePocketGuide = () => {
  const context = useContext(PocketGuideContext);
  if (!context) {
    throw new Error('usePocketGuide must be used within a PocketGuideProvider');
  }
  return context;
};