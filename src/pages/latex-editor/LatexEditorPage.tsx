import React, { useState, useMemo } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
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
    <div className="flex h-screen w-full bg-ide-base text-ide-text font-sans overflow-hidden">
      {/* Sidebar Nav */}
      <aside className="w-[64px] bg-ide-surface border-r border-ide-border flex flex-col items-center py-5 gap-6 shrink-0 z-10">
        <div 
          onClick={() => togglePanel('showExplorer')}
          className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer transition-all ${settings.showExplorer ? 'bg-ide-accent/20 text-ide-accent' : 'text-ide-muted hover:text-ide-text hover:bg-ide-panel'}`}
          title="Toggle Explorer"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer text-ide-muted hover:text-ide-text hover:bg-ide-panel transition-all">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Header */}
        <header className="h-[48px] border-b border-ide-border flex items-center justify-between px-4 bg-ide-surface shrink-0">
          <div className="flex items-center gap-3 text-[13px] font-medium">
            <span className="text-ide-muted">Projects /</span>
            <strong>{project.name}</strong>
            <span className="bg-ide-accent text-white px-1.5 py-0.5 rounded text-[10px] font-bold">NEW</span>
          </div>
          <div className="flex bg-ide-base border border-ide-border rounded-md p-0.5 gap-0.5">
            <button 
              onClick={() => togglePanel('showExplorer')} 
              className={`px-3 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${settings.showExplorer ? 'bg-ide-panel text-ide-text shadow-sm' : 'text-ide-muted hover:text-ide-text hover:bg-ide-panel/50'}`}
            >
              Explorer
            </button>
            <button 
              onClick={() => togglePanel('showEditor')} 
              className={`px-3 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${settings.showEditor ? 'bg-ide-panel text-ide-text shadow-sm' : 'text-ide-muted hover:text-ide-text hover:bg-ide-panel/50'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => togglePanel('showPreview')} 
              className={`px-3 py-1 text-[11px] font-medium rounded cursor-pointer transition-colors ${settings.showPreview ? 'bg-ide-panel text-ide-text shadow-sm' : 'text-ide-muted hover:text-ide-text hover:bg-ide-panel/50'}`}
            >
              Preview
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCompile}
              className="bg-ide-accent text-white px-3 py-1 rounded text-[11px] font-semibold cursor-pointer hover:bg-ide-accent-hover transition-colors"
            >
              Compile PDF
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 flex overflow-hidden bg-ide-base p-2 gap-2">
          <PanelGroup direction="horizontal" autoSaveId="ide-workspace-layout">
            {settings.showExplorer && (
              <>
                <Panel id="explorer-panel" order={1} defaultSize={20} minSize={10} collapsible={true}>
                  <div className="h-full rounded-xl border border-ide-border overflow-hidden bg-ide-surface">
                    <FileTree 
                      files={project.files} 
                      activeFileId={activeFile?.id || null} 
                      onSelectFile={setActiveFileId} 
                      onClose={() => togglePanel('showExplorer')}
                    />
                  </div>
                </Panel>
                <PanelResizeHandle id="explorer-resize" className="w-[8px] group bg-transparent hover:bg-ide-accent/20 active:bg-ide-accent/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10 rounded-full mx-1">
                  <div className="w-[2px] h-8 bg-ide-border group-hover:bg-ide-accent group-active:bg-ide-accent rounded-full" />
                </PanelResizeHandle>
              </>
            )}

            <Panel id="main-panel" order={2} defaultSize={settings.showExplorer ? 80 : 100}>
              <div className="flex-1 flex flex-col h-full min-w-0 rounded-xl border border-ide-border overflow-hidden bg-ide-surface">
                <div className="flex-1 overflow-hidden">
                  <PanelGroup direction="horizontal" autoSaveId="ide-editor-preview-layout">
                    {settings.showEditor && (
                      <Panel id="editor-panel" order={1} defaultSize={50} minSize={20}>
                        <EditorPane content={activeFile?.content || ''} onChange={handleContentChange} />
                      </Panel>
                    )}
                    
                    {settings.showEditor && settings.showPreview && (
                      <PanelResizeHandle id="editor-preview-resize" className="w-[8px] group bg-transparent hover:bg-ide-accent/20 active:bg-ide-accent/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10 mx-1">
                        <div className="w-[2px] h-8 bg-ide-border group-hover:bg-ide-accent group-active:bg-ide-accent rounded-full" />
                      </PanelResizeHandle>
                    )}

                    {settings.showPreview && (
                      <Panel id="preview-panel" order={2} defaultSize={50} minSize={20}>
                        <PreviewPane content={activeFile?.content || ''} />
                      </Panel>
                    )}
                  </PanelGroup>
                </div>
              </div>
            </Panel>
          </PanelGroup>

          {showAI && (
            <div className="rounded-xl border border-ide-border overflow-hidden bg-ide-surface shrink-0 h-full">
              <AIAssistPanel 
                messages={messages}
                isGenerating={isGenerating}
                onSendMessage={(prompt) => sendMessage(prompt, activeFile?.content || '')}
                onClose={() => setShowAI(false)}
              />
            </div>
          )}
        </main>

        {/* Footer Status Bar */}
        <footer className="h-[28px] bg-ide-surface border-t border-ide-border flex items-center px-4 text-[11px] justify-between shrink-0 font-mono text-ide-muted">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-ide-success"></div> Connected</span>
            <span>Ln 10, Col 14</span>
            <span>UTF-8</span>
          </div>
          <div className="flex gap-6">
            <span>LaTeX: article</span>
            <span>Syncing...</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
