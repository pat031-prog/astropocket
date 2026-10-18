import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, TraditionMode } from '../types';
import { usePocketGuide } from './PocketGuide/PocketGuideContext';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentMode: TraditionMode;
  onModeChange: (mode: TraditionMode) => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
}

const WELCOME_MESSAGES = [
  { 
    kanji: "錬金術", 
    lines: ["Como es arriba", "es abajo", "el universo es mental"] 
  },
  { 
    kanji: "自由意志", 
    lines: ["Las estrellas inclinan", "pero no obligan", "tu voluntad manda"] 
  },
  { 
    kanji: "不動", 
    lines: ["No es suave", "el camino a los astros", "desde la tierra"] 
  },
  { 
    kanji: "深淵", 
    lines: ["Si miras al abismo", "el abismo también", "te mira a ti"] 
  },
  { 
    kanji: "星屑", 
    lines: ["Somos el medio", "para que el cosmos", "se conozca a sí mismo"] 
  },
  { 
    kanji: "時間", 
    lines: ["El tiempo es", "una ilusión", "terriblemente persistente"] 
  },
  { 
    kanji: "探求", 
    lines: ["Lo que buscas", "te está buscando", "ahora mismo"] 
  },
  { 
    kanji: "変化", 
    lines: ["Lo creativo", "conoce el comienzo", "de todas las cosas"] 
  },
  { 
    kanji: "流転", 
    lines: ["Ningún hombre", "pisa dos veces", "el mismo río"] 
  },
  { 
    kanji: "覚醒", 
    lines: ["Quien mira afuera sueña", "quien mira adentro", "despierta"] 
  }
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentMode,
  onModeChange,
  onSendMessage,
  isLoading,
  inputText,
  setInputText
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMessage, setActiveMessage] = useState(WELCOME_MESSAGES[0]);
  
  // Destructure explicit controls for the assistant
  const { trigger, state: guideState, setHidden: setGuideHidden } = usePocketGuide();

  useEffect(() => {
    const randomMsg = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    setActiveMessage(randomMsg);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isLoading) {
      trigger('START_COMPUTE'); 
      onSendMessage(inputText);
    } else if (!inputText.trim()) {
      trigger('ERROR', "Input vacío.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFocus = () => {
    trigger('FOCUS_INPUT'); 
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent-secondary font-bold tracking-tight">$1</strong>');
      
      if (line.trim().startsWith('[') && line.includes(']')) {
         return (
            <div key={i} className="text-center my-8 animate-pulse-slow">
                <span className="text-4xl md:text-5xl font-mono text-accent-personal opacity-90 drop-shadow-[0_0_8px_rgba(255,214,10,0.5)]" dangerouslySetInnerHTML={{ __html: bolded }} />
            </div>
         );
      }
      
      if (line.trim().startsWith('- ')) {
        return <div key={i} className="pl-6 mb-2 relative text-gray-300 group hover:text-white transition-colors duration-300" dangerouslySetInnerHTML={{ __html: `<span class="absolute left-0 text-accent-secondary opacity-50 group-hover:opacity-100 transition-opacity">❖</span>${bolded.substring(2)}` }} />;
      }

      if (line.trim() === '---') {
          return <div key={i} className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />;
      }

      return <div key={i} className="mb-3 leading-relaxed text-gray-300/90 font-light tracking-wide" dangerouslySetInnerHTML={{ __html: bolded }} />;
    });
  };

  return (
    <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(20,10,35,0.4)_0%,_rgba(5,2,10,0.8)_100%)]">
      <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-deep/80 backdrop-blur-xl z-10 sticky top-0 shrink-0 shadow-lg transition-all duration-500">
        <div className="flex flex-col justify-center group cursor-default">
            <h1 className="font-retro text-2xl md:text-4xl text-white tracking-[0.2em] drop-shadow-[0_0_15px_rgba(224,170,255,0.2)] leading-none transition-all group-hover:drop-shadow-[0_0_20px_rgba(224,170,255,0.4)]">
            ASTRO<span className="text-accent-primary opacity-80 group-hover:text-white transition-colors">PKT</span>
            </h1>
            <div className="hidden md:flex text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-1 items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                Deep Space Intelligence v9.6
            </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
            {/* SUMMON BUTTON / GUIDE TOGGLE */}
            <button
                onClick={() => {
                    if (guideState === 'hidden') {
                        setGuideHidden(false);
                        trigger('NAVIGATE', "Asistente convocado.");
                    } else {
                        trigger('FOCUS_INPUT', "¿Me llamabas?");
                    }
                }}
                className={`
                    flex items-center justify-center w-8 h-8 rounded border transition-all duration-300
                    ${guideState === 'hidden' 
                        ? 'border-white/10 text-gray-500 hover:text-accent-secondary hover:border-accent-secondary/50 bg-transparent' 
                        : 'border-accent-secondary/30 text-accent-secondary bg-accent-secondary/10 shadow-[0_0_10px_rgba(78,168,222,0.2)]'}
                `}
                title={guideState === 'hidden' ? "Invocar Asistente" : "Asistente Activo"}
            >
                <span className="text-sm">❖</span>
            </button>

            <div className="w-px h-6 bg-white/10 mx-1"></div>

            <div className="relative group">
                <div className="absolute inset-0 bg-accent-secondary/10 blur-lg rounded opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <select 
                    value={currentMode}
                    onChange={(e) => {
                        onModeChange(e.target.value as TraditionMode);
                        trigger('NAVIGATE', `Protocolo: ${e.target.value}.`);
                    }}
                    className="relative bg-black/40 hover:bg-black/60 border border-white/10 hover:border-accent-secondary/50 text-accent-secondary hover:text-white text-[10px] md:text-xs font-mono py-1.5 px-3 rounded shadow-inner transition-all focus:outline-none focus:border-accent-primary uppercase tracking-wider cursor-pointer appearance-none text-right backdrop-blur-md"
                    style={{backgroundImage: 'none'}} 
                >
                    <optgroup label="CORE SYSTEMS" className="bg-deep text-gray-300">
                    <option value="HELLENISTIC">HELLENISTIC</option>
                    <option value="VEDIC">VEDIC</option>
                    <option value="MODERN">MODERN</option>
                    </optgroup>
                    <optgroup label="ADVANCED" className="bg-deep text-gray-300">
                    <option value="DRACONIC">DRACONIC</option>
                    </optgroup>
                    <optgroup label="EXPERIMENTAL" className="bg-deep text-gray-300">
                    <option value="ORACLE">ORACLE</option>
                    <option value="ARCHETYPE">ARCHETYPE</option>
                    <option value="KOYOMI">KOYOMI</option>
                    </optgroup>
                </select>
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 md:p-10 space-y-6 md:space-y-10 scroll-smooth">
        {messages.length === 0 && (
            <div className="flex h-full items-center justify-center opacity-30 select-none pointer-events-none">
                <div className="text-center transform transition-transform duration-1000 hover:scale-105">
                    <div className="font-sans font-bold text-7xl md:text-9xl mb-8 text-white tracking-widest animate-pulse-slow drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] opacity-40">
                        {activeMessage.kanji}
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-secondary/30 to-transparent hidden md:block"></div>
                        <div className="absolute -right-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-secondary/30 to-transparent hidden md:block"></div>
                        {activeMessage.lines.map((line, idx) => (
                           <div 
                              key={idx} 
                              className="font-mono text-xs md:text-sm tracking-[0.3em] text-accent-secondary/90 uppercase"
                              style={{ opacity: 1 - (idx * 0.25) }}
                           >
                              {line}
                           </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-fade`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`
              relative max-w-[90%] md:max-w-[75%] lg:max-w-[65%]
              ${msg.role === 'user' 
                ? 'bg-gradient-to-br from-accent-secondary/10 to-transparent border border-accent-secondary/20 text-gray-100 rounded-2xl rounded-tr-sm shadow-glow-secondary' 
                : 'bg-glass-card text-gray-100 rounded-2xl rounded-tl-sm backdrop-blur-2xl shadow-glass'}
              p-5 md:p-8 font-mono text-sm transition-all hover:border-white/20
            `}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5 text-[9px] md:text-[10px] font-mono tracking-widest uppercase">
                 <span className={`${msg.role === 'model' ? 'text-accent-primary drop-shadow-[0_0_5px_rgba(224,170,255,0.5)]' : 'text-accent-secondary'} font-bold`}>
                    {msg.role === 'user' ? '► PILOT INPUT' : `:: PROTOCOL [${currentMode}]`}
                 </span>
                 <span className="opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="tracking-wide text-[13px] md:text-sm selection:bg-accent-primary/30 selection:text-white">
                {formatContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start animate-slide-up-fade">
                <div className="bg-glass-surface border border-white/5 px-5 py-4 rounded-full flex items-center gap-4 shadow-glass">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-[10px] font-mono text-accent-primary/70 tracking-[0.2em] animate-pulse">COMPUTING</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-3 md:p-8 bg-gradient-to-t from-deep via-deep/95 to-transparent z-20 shrink-0 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto flex items-end gap-3 md:gap-5">
            <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-accent-secondary/5 blur-xl rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Enter coordinates or query..."
                    className="w-full bg-black/40 text-white font-mono text-base md:text-sm p-4 md:p-6 pr-2 md:pr-12 border border-white/10 group-focus-within:border-accent-secondary/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-secondary/20 resize-none min-h-[56px] max-h-[200px] transition-all placeholder-gray-600/70 shadow-inner backdrop-blur-md"
                    style={{ height: 'auto' }}
                    rows={1}
                />
            </div>
            <button 
                type="submit" 
                disabled={isLoading || !inputText.trim()}
                className="h-[56px] md:h-[70px] px-6 md:px-10 bg-gradient-to-b from-white/10 to-white/5 hover:from-accent-secondary/20 hover:to-accent-secondary/10 border border-white/10 hover:border-accent-secondary/50 text-accent-secondary hover:text-white rounded-xl transition-all duration-300 font-retro text-lg md:text-2xl tracking-widest disabled:opacity-20 disabled:cursor-not-allowed uppercase shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(78,168,222,0.2)] active:scale-95 active:shadow-inner"
            >
                SEND
            </button>
        </form>
      </div>
    </main>
  );
};

export default ChatInterface;