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
    <aside className="w-full bg-primary-900 flex flex-col h-full shrink-0 font-sans">
      <div className="h-[40px] bg-primary-800 border-b border-primary-800 flex items-center justify-between px-4 text-xs font-medium text-primary-100 shrink-0">
        <span>Explorer</span>
        {onClose && (
          <button onClick={onClose} className="text-primary-500 hover:text-primary-100 transition-colors" title="Close Explorer">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      <div className="py-3 flex-1 overflow-y-auto">
        <div className="py-1.5 px-4 text-xs font-semibold tracking-wider flex items-center gap-2 text-primary-500 mb-1">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          PROJECT FILES
        </div>
        <div className="flex flex-col gap-0.5 px-2">
          {files.map(file => (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`px-3 py-1.5 text-[13px] rounded-md cursor-pointer flex items-center gap-2.5 transition-colors ${
                activeFileId === file.id 
                  ? 'bg-primary-600 text-white font-medium' 
                  : 'text-primary-500 hover:bg-primary-800 hover:text-primary-100'
              }`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 opacity-80"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              {file.name}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
