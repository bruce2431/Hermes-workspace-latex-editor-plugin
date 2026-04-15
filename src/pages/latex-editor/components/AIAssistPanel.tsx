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
    <aside className="flex flex-col h-full bg-[#11111a] w-[280px] shrink-0">
      <div className="h-[32px] bg-[#14141e] border-b border-[#1e293b] flex items-center justify-between px-3 text-[11px] uppercase tracking-wider text-[#22d3ee] shrink-0">
        <span>Hermes AI Assistant</span>
        <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0]">✕</button>
      </div>
      
      <div className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="bg-[#22d3ee]/10 border border-[#22d3ee]/20 self-start rounded-lg rounded-bl-sm p-2.5 text-[12px] leading-relaxed text-[#e2e8f0]">
            How can I help you with your LaTeX today? I can generate formulas, fix errors, or explain code.
          </div>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`p-2.5 text-[12px] leading-relaxed text-[#e2e8f0] rounded-lg ${
              msg.role === 'user' 
                ? 'bg-[#1e293b] self-end rounded-br-sm' 
                : 'bg-[#22d3ee]/10 border border-[#22d3ee]/20 self-start rounded-bl-sm'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {isGenerating && (
          <div className="text-[12px] text-[#22d3ee] animate-pulse">Thinking...</div>
        )}
      </div>

      <div className="p-3 border-t border-[#1e293b]">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask AI (Ctrl+/)..."
          className="w-full bg-[#000] border border-[#1e293b] rounded-md text-[#e2e8f0] p-2 text-[12px] focus:outline-none focus:border-[#22d3ee] transition-colors"
        />
      </div>
    </aside>
  );
};
