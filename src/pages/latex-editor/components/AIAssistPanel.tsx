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
    <aside className="flex flex-col h-full bg-hermes-card border-l border-hermes-border w-[280px] shrink-0 font-mono">
      <div className="h-[32px] bg-hermes-bg border-b border-hermes-border flex items-center justify-between px-3 text-[11px] uppercase tracking-wider text-hermes-warning shrink-0">
        <span>Hermes AI Assistant</span>
        <button onClick={onClose} className="text-hermes-fg/60 hover:text-hermes-fg">✕</button>
      </div>
      
      <div className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="bg-hermes-warning/10 border border-hermes-warning/20 self-start rounded-lg rounded-bl-sm p-2.5 text-[12px] leading-relaxed text-hermes-fg">
            How can I help you with your LaTeX today? I can generate formulas, fix errors, or explain code.
          </div>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`p-2.5 text-[12px] leading-relaxed text-hermes-fg rounded-lg ${
              msg.role === 'user' 
                ? 'bg-hermes-bg border border-hermes-border self-end rounded-br-sm' 
                : 'bg-hermes-warning/10 border border-hermes-warning/20 self-start rounded-bl-sm'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isGenerating && (
          <div className="text-[12px] text-hermes-warning animate-pulse">Thinking...</div>
        )}
      </div>

      <div className="p-3 border-t border-hermes-border bg-hermes-bg">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask AI (Ctrl+/)..."
          className="w-full bg-hermes-card border border-hermes-border rounded-md text-hermes-fg p-2 text-[12px] focus:outline-none focus:border-hermes-warning transition-colors"
        />
      </div>
    </aside>
  );
};
