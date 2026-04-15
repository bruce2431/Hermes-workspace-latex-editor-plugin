import React from 'react';
import { LatexFile } from '@/types/latex';

interface FileTreeProps {
  files: LatexFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onClose?: () => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, activeFileId, onSelectFile, onClose }) => {
  return (
    <aside className="w-full bg-[#0a0a0f] flex flex-col h-full shrink-0">
      <div className="h-[32px] bg-[#14141e] border-b border-[#1e293b] flex items-center justify-between px-3 text-[11px] uppercase tracking-wider text-[#94a3b8] shrink-0">
        <span>Explorer</span>
        {onClose && (
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0] transition-colors" title="Close Explorer">
            ✕
          </button>
        )}
      </div>
      <div className="py-2 flex-1 overflow-y-auto">
        <div className="py-1.5 px-4 text-[12px] flex items-center gap-2 text-[#94a3b8] opacity-50">
          <span>📁</span> src/
        </div>
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`py-1.5 px-4 pl-8 text-[12px] flex items-center gap-2 cursor-pointer transition-colors ${
              activeFileId === file.id 
                ? 'bg-[#22d3ee]/5 text-[#22d3ee]' 
                : 'text-[#e2e8f0] hover:bg-[#22d3ee]/10'
            }`}
          >
            <span>📄</span> {file.name}
          </div>
        ))}
        <div className="py-1.5 px-4 text-[12px] flex items-center gap-2 text-[#94a3b8] opacity-50">
          <span>📁</span> figures/
        </div>
      </div>
    </aside>
  );
};
