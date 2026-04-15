import React, { useState, useMemo } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { ToolBar } from './components/ToolBar';
import { AIAssistPanel } from './components/AIAssistPanel';
import { FileTree } from './components/FileTree';
import { useLatexEditor } from '@/hooks/useLatexEditor';
import { useLatexProject } from '@/hooks/useLatexProject';
import { useAIAssist } from '@/hooks/useAIAssist';
import { latexApi } from '@/lib/latex-api';

export default function LatexEditorPage() {
  const { project, updateFile, isLoading } = useLatexProject();
  const { settings, activeFileId, setActiveFileId, togglePanel } = useLatexEditor();
  const { messages, isGenerating, sendMessage } = useAIAssist();
  
  const [showAI, setShowAI] = useState(true);

  const activeFile = useMemo(() => {
    if (!project) return null;
    return project.files.find(f => f.id === activeFileId) || project.files[0];
  }, [project, activeFileId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-[#22d3ee] animate-pulse">Loading Hermes LaTeX Environment...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-red-500">Failed to initialize project space.</div>;
  }

  const handleContentChange = (content: string) => {
    if (activeFile) updateFile(activeFile.id, content);
  };

  const handleInsertSymbol = (command: string) => {
    if (activeFile) updateFile(activeFile.id, activeFile.content + command);
  };

  const handleCompile = async () => {
    if (!project) return;
    const mainFile = project.files.find(f => f.id === project.mainFileId);
    if (!mainFile) return;

    // Parse magic comment for compiler
    const match = mainFile.content.match(/^%\s*!TEX\s+program\s*=\s*(pdflatex|xelatex|lualatex)/im);
    const compiler = match ? match[1] : 'pdflatex';

    const filesRecord = project.files.reduce((acc, f) => {
      acc[f.name] = f.content;
      return acc;
    }, {} as Record<string, string>);

    try {
      const result = await latexApi.compile(filesRecord, mainFile.name, compiler);
      if (result.success) {
        console.log(`Compiled successfully using ${compiler}`);
      } else {
        console.error('Compile failed:', result.errors);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-hermes-bg text-hermes-fg font-sans overflow-hidden relative">
      <div className="hermes-noise"></div>
      <div className="hermes-glow"></div>

      {/* Sidebar Nav (Mocked to match design) */}
      <aside className="w-[64px] bg-hermes-bg border-r border-hermes-border flex flex-col items-center py-5 gap-6 shrink-0 z-10 relative">
        <div 
          onClick={() => togglePanel('showExplorer')}
          className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer transition-all ${settings.showExplorer ? 'bg-hermes-fg/10 border border-hermes-fg text-hermes-fg opacity-100' : 'bg-hermes-card text-hermes-fg opacity-60 hover:opacity-100 hover:bg-hermes-card-hover'}`}
          title="Toggle Explorer"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <div className="w-[32px] h-[32px] rounded-lg bg-hermes-card flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 hover:bg-hermes-card-hover transition-all">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-hermes-fg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="h-[48px] border-b border-hermes-border flex items-center justify-between px-4 bg-hermes-card shrink-0">
          <div className="flex items-center gap-3 text-[13px] font-display tracking-wide hermes-title-glow">
            <span className="opacity-50">Projects /</span>
            <strong>{project.name}</strong>
            <span className="bg-hermes-warning text-hermes-bg px-1.5 py-0.5 rounded text-[10px] font-extrabold">NEW</span>
          </div>
          <div className="flex bg-hermes-bg border border-hermes-border rounded-md p-0.5 gap-0.5">
            <button 
              onClick={() => togglePanel('showExplorer')} 
              className={`px-3 py-1 text-[11px] rounded cursor-pointer transition-colors ${settings.showExplorer ? 'bg-hermes-card text-hermes-fg' : 'text-hermes-fg/60 hover:text-hermes-fg hover:bg-hermes-card-hover'}`}
            >
              Explorer
            </button>
            <button 
              onClick={() => togglePanel('showEditor')} 
              className={`px-3 py-1 text-[11px] rounded cursor-pointer transition-colors ${settings.showEditor ? 'bg-hermes-card text-hermes-fg' : 'text-hermes-fg/60 hover:text-hermes-fg hover:bg-hermes-card-hover'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => togglePanel('showPreview')} 
              className={`px-3 py-1 text-[11px] rounded cursor-pointer transition-colors ${settings.showPreview ? 'bg-hermes-card text-hermes-fg' : 'text-hermes-fg/60 hover:text-hermes-fg hover:bg-hermes-card-hover'}`}
            >
              Preview
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCompile}
              className="bg-hermes-warning text-hermes-bg px-3 py-1 rounded text-[11px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Compile PDF
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 flex overflow-hidden">
          <PanelGroup direction="horizontal">
            {settings.showExplorer && (
              <>
                <Panel defaultSize={20} minSize={10} maxSize={50} collapsible={true}>
                  <FileTree 
                    files={project.files} 
                    activeFileId={activeFile?.id || null} 
                    onSelectFile={setActiveFileId} 
                    onClose={() => togglePanel('showExplorer')}
                  />
                </Panel>
                <PanelResizeHandle className="w-[4px] group bg-transparent hover:bg-hermes-fg/20 active:bg-hermes-fg/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10">
                  <div className="w-[1px] h-full bg-hermes-border group-hover:bg-transparent group-active:bg-transparent" />
                </PanelResizeHandle>
              </>
            )}

            <Panel defaultSize={settings.showExplorer ? 80 : 100}>
              <div className="flex-1 flex flex-col h-full min-w-0">
                {settings.showEditor && <ToolBar onInsert={handleInsertSymbol} />}
                <div className="flex-1 overflow-hidden">
                  <PanelGroup direction="horizontal">
                    {settings.showEditor && (
                      <Panel defaultSize={50} minSize={20}>
                        <EditorPane content={activeFile?.content || ''} onChange={handleContentChange} />
                      </Panel>
                    )}
                    
                    {settings.showEditor && settings.showPreview && (
                      <PanelResizeHandle className="w-[4px] group bg-transparent hover:bg-hermes-fg/20 active:bg-hermes-fg/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10">
                        <div className="w-[1px] h-full bg-hermes-border group-hover:bg-transparent group-active:bg-transparent" />
                      </PanelResizeHandle>
                    )}

                    {settings.showPreview && (
                      <Panel defaultSize={50} minSize={20}>
                        <PreviewPane content={activeFile?.content || ''} />
                      </Panel>
                    )}
                  </PanelGroup>
                </div>
              </div>
            </Panel>
          </PanelGroup>

          {showAI && (
            <AIAssistPanel 
              messages={messages}
              isGenerating={isGenerating}
              onSendMessage={(prompt) => sendMessage(prompt, activeFile?.content || '')}
              onClose={() => setShowAI(false)}
            />
          )}
        </main>

        {/* Footer Status Bar */}
        <footer className="h-[24px] bg-hermes-card border-t border-hermes-border flex items-center px-3 text-[10px] justify-between shrink-0 font-mono">
          <div className="flex gap-4">
            <span>Ln 10, Col 14</span>
            <span>UTF-8</span>
            <span className="text-hermes-success">● Connected to Agent</span>
          </div>
          <div className="flex gap-4">
            <span>LaTeX: article</span>
            <span>Syncing...</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
