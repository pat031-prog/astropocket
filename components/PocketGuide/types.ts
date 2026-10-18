export type GuideState = 'idle' | 'listening' | 'scanning' | 'computing' | 'speaking' | 'success' | 'warning' | 'hidden';

export interface GuideMessage {
  text: string;
  duration?: number; // ms to stay on screen
  id: string; // unique id to force re-render of bubble
  isHint?: boolean;
}

export interface PocketGuideContextType {
  state: GuideState;
  message: GuideMessage | null;
  isMuted: boolean;
  trigger: (action: GuideAction, customText?: string) => void;
  toggleMute: () => void;
  setHidden: (hidden: boolean) => void;
}

export type GuideAction = 
  | 'FOCUS_INPUT' 
  | 'START_COMPUTE' 
  | 'COMPLETE_SUCCESS' 
  | 'ERROR' 
  | 'NAVIGATE'
  | 'IDLE_TIMEOUT'
  | 'GIVE_HINT'; // New action for guidance
