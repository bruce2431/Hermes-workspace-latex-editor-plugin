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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const renderMessageContent = (content: string) => {
    // Specifically handle the injected mock LaTeX response with code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.split('\n');
        const langInfo = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        
        return (
          <div key={i} className="my-2 rounded-lg border border-[#353535] bg-[#1e1e1e] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252525] border-b border-[#353535]">
              <span className="text-[11px] text-primary-500 uppercase tracking-wider">{langInfo || 'code'}</span>
              <button 
                onClick={() => handleCopyCode(code)}
                className="text-primary-500 hover:text-primary-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                复制
              </button>
            </div>
            <div className="p-3 overflow-x-auto">
              <pre className="text-[12px] font-mono text-primary-300 m-0">
                <code className="block whitespace-pre">
                  <span className="text-primary-500 select-none mr-3">1</span>
                  {code}
                </code>
              </pre>
            </div>
          </div>
        );
      }
      return <div key={i} className="whitespace-pre-wrap leading-relaxed">{part}</div>;
    });
  };

  return (
    <aside className="flex flex-col h-full bg-primary-900 w-[300px] shrink-0 font-sans">
      <div className="h-[40px] bg-primary-800 border-b border-primary-800 flex items-center justify-between px-4 text-xs font-medium text-primary-100 shrink-0">
        <div className="flex items-center gap-2">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-primary-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span>AI Assistant</span>
        </div>
        <button onClick={onClose} className="text-primary-500 hover:text-primary-100 transition-colors">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="bg-primary-800 border border-primary-800 rounded-lg p-3text-[13px] leading-relaxed text-primary-100 shadow-sm relative">
            <div className="absolute top-0 right-0 p-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </div>
            How can I help you with your LaTeX today? I can generate formulas, fix errors, or explain code.
          </div>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[90%] p-3 text-[13px] leading-relaxed rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#2a2a2a] text-primary-100' 
                  : 'bg-transparent text-primary-100'
              }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="text-[13px] text-primary-500 flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-primary-800 bg-primary-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask AI..."
            className="w-full bg-primary-950 border border-primary-800 rounded-lg text-primary-100 py-2.5 pl-3 pr-10 text-[13px] focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors p-1 cursor-pointer"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
