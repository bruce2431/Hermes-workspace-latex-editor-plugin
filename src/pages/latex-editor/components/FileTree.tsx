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
    <aside className="w-full bg-hermes-bg flex flex-col h-full shrink-0 font-mono">
      <div className="h-[32px] bg-hermes-card border-b border-hermes-border flex items-center justify-between px-3 text-[11px] uppercase tracking-wider text-hermes-fg/60 shrink-0">
        <span>Explorer</span>
        {onClose && (
          <button onClick={onClose} className="text-hermes-fg/60 hover:text-hermes-fg transition-colors" title="Close Explorer">
            ✕
          </button>
        )}
      </div>
      <div className="py-2 flex-1 overflow-y-auto">
        <div className="py-1.5 px-4 text-[12px] flex items-center gap-2 text-hermes-fg/50">
          <span>📁</span> src/
        </div>
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`py-1.5 px-4 pl-8 text-[12px] flex items-center gap-2 cursor-pointer transition-colors ${
              activeFileId === file.id 
                ? 'bg-hermes-fg text-hermes-bg font-bold' 
                : 'text-hermes-fg/80 hover:bg-hermes-card-hover'
            }`}
          >
            <span>📄</span> {file.name}
          </div>
        ))}
        <div className="py-1.5 px-4 text-[12px] flex items-center gap-2 text-hermes-fg/50">
          <span>📁</span> figures/
        </div>
      </div>
    </aside>
  );
};
