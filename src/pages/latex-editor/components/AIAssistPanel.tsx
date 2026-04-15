import React, { useState } from 'react';
import { AIMessage } from '@/types/latex';

interface AIAssistPanelProps {
  messages: AIMessage[];
  isGenerating: boolean;
  onSendMessage: (prompt: string) => void;
  onClose: () => void;
}

export const AIAssistPanel: React.FC<AIAssistPanelProps> = ({ messages, isGenerating, onSendMessage, onClose }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <aside className="flex flex-col h-full bg-ide-surface w-[300px] shrink-0 font-sans">
      <div className="h-[40px] bg-ide-panel border-b border-ide-border flex items-center justify-between px-4 text-[12px] font-medium text-ide-text shrink-0">
        <div className="flex items-center gap-2">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-ide-accent"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span>AI Assistant</span>
        </div>
        <button onClick={onClose} className="text-ide-muted hover:text-ide-text transition-colors">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="bg-ide-panel border border-ide-border rounded-xl rounded-tl-sm p-3.5 text-[13px] leading-relaxed text-ide-text shadow-sm">
            How can I help you with your LaTeX today? I can generate formulas, fix errors, or explain code.
          </div>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`p-3.5 text-[13px] leading-relaxed rounded-xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-ide-accent text-white self-end rounded-tr-sm ml-6' 
                : 'bg-ide-panel border border-ide-border text-ide-text self-start rounded-tl-sm mr-6'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isGenerating && (
          <div className="text-[13px] text-ide-muted flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-ide-accent animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-ide-border bg-ide-surface">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask AI..."
            className="w-full bg-ide-base border border-ide-border rounded-lg text-ide-text py-2.5 pl-3 pr-10 text-[13px] focus:outline-none focus:border-ide-accent focus:ring-1 focus:ring-ide-accent transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ide-muted hover:text-ide-accent transition-colors p-1"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
