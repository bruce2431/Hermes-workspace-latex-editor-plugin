import React, { useEffect, useRef, useState, useCallback } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface PreviewPaneProps {
  content: string;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [debouncedContent, setDebouncedContent] = useState(content);
  
  const [zoom, setZoom] = useState(1);
  const [isFit, setIsFit] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 300);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (contentRef.current) {
      try {
        const docMatch = debouncedContent.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
        const renderContent = docMatch ? docMatch[1] : debouncedContent;
        
        katex.render(renderContent, contentRef.current, {
          throwOnError: false,
          displayMode: true,
          strict: false,
          trust: true
        });
      } catch (error) {
        contentRef.current.innerText = String(error);
      }
    }
  }, [debouncedContent]);

  // Handle Zoom to Fit
  useEffect(() => {
    if (!isFit || !containerRef.current || !contentRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        // Assume a base width for our "PDF page" (e.g., 800px)
        const baseWidth = 800;
        // Leave some padding
        const newZoom = Math.max(0.2, Math.min((containerWidth - 40) / baseWidth, 3));
        setZoom(newZoom);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFit]);

  // Handle Wheel Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setIsFit(false);
        setZoom(prev => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.max(0.2, Math.min(prev + delta, 5));
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section className="flex flex-col h-full bg-ide-surface font-sans">
      <div className="h-[40px] bg-ide-panel border-b border-ide-border flex items-center justify-between px-4 text-[12px] font-medium text-ide-text shrink-0">
        <span>Live Preview</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFit(true)}
            className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-medium ${isFit ? 'bg-ide-accent text-white' : 'hover:bg-ide-border text-ide-muted hover:text-ide-text'}`}
          >
            Fit
          </button>
          <select 
            value={Math.round(zoom * 100)} 
            onChange={(e) => {
              setIsFit(false);
              setZoom(Number(e.target.value) / 100);
            }}
            className="bg-ide-base border border-ide-border rounded-md px-2 py-1 outline-none text-ide-text text-[11px] font-medium focus:border-ide-accent"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
            <option value={200}>200%</option>
          </select>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto p-8 text-black flex justify-center items-start bg-ide-base"
      >
        <div 
          className="bg-white shadow-xl origin-top transition-transform duration-75 ease-out text-left rounded-sm"
          style={{ 
            width: '800px', 
            minHeight: '1131px', // A4 aspect ratio
            transform: `scale(${zoom})`,
            padding: '48px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            color: '#111827' // Dark slate text for PDF
          }}
        >
          <div ref={contentRef} className="text-[16px] leading-relaxed font-serif" />
        </div>
      </div>
    </section>
  );
};
