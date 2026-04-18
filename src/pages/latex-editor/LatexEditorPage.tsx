import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { AIAssistPanel } from './components/AIAssistPanel';
import { FileTree } from './components/FileTree';
import { useLatexEditor } from '@/hooks/useLatexEditor';
import { useLatexProject } from '@/hooks/useLatexProject';
import { useAIAssist } from '@/hooks/useAIAssist';
import { latexApi } from '@/lib/latex-api';
import { Home, Eye, MessageSquare, FileOutput, ArrowUp, Check, ChevronDown, ChevronUp, Pencil, Trash, Copy, Download, Sparkles } from 'lucide-react';

export default function LatexEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id') || undefined;

  const { project, updateFile, setProject, saveProject, deleteProject, isLoading } = useLatexProject(projectId);
  const { settings, activeFileId, setActiveFileId, togglePanel } = useLatexEditor();
  const { messages, isGenerating, sendMessage, appendMessage } = useAIAssist();
  
  const [showAI, setShowAI] = useState(true);

  // Ctrl+K menu states
  const [aiMenu, setAiMenu] = useState<{ top: number, left: number, selectedText: string, from: number, to: number } | null>(null);
  const [aiMenuPrompt, setAiMenuPrompt] = useState("");

  const [commentDialog, setCommentDialog] = useState<{ top: number, left: number, selectedText: string, from: number, to: number } | null>(null);
  const [commentText, setCommentText] = useState("");

  const [moveFileDialog, setMoveFileDialog] = useState<{ selectedText: string, from: number, to: number } | null>(null);
  const [moveFileName, setMoveFileName] = useState("");

  const [isCompiling, setIsCompiling] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const projectTitleRef = useRef<HTMLDivElement>(null);

  // Custom Modal States
  const [renameDialog, setRenameDialog] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);

  const activeFile = useMemo(() => {
    if (!project) return null;
    return project.files.find(f => f.id === activeFileId) || project.files[0];
  }, [project, activeFileId]);

  const activeCompiler = useMemo(() => {
    if (!project) return 'pdflatex';
    const mainFile = project.files.find(f => f.id === project.mainFileId);
    if (!mainFile) return 'pdflatex';
    const match = mainFile.content.match(/^%\s*!TEX\s+program\s*=\s*(pdflatex|xelatex|lualatex)/im);
    return match ? match[1] : 'pdflatex';
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        projectMenuRef.current && 
        !projectMenuRef.current.contains(e.target as Node) &&
        projectTitleRef.current &&
        !projectTitleRef.current.contains(e.target as Node)
      ) {
        setShowProjectMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenameProject = () => {
    if (!project) return;
    setRenameValue(project.name);
    setRenameDialog(true);
    setShowProjectMenu(false);
  };

  const submitRename = async () => {
    if (project && renameValue.trim()) {
      const updated = { ...project, name: renameValue.trim(), updatedAt: Date.now() };
      await saveProject(updated);
    }
    setRenameDialog(false);
  };

  const handleDeleteProject = () => {
    setDeleteDialog(true);
    setShowProjectMenu(false);
  };

  const confirmDelete = async () => {
    await deleteProject();
    setDeleteDialog(false);
    navigate('/');
  };

  const handleDuplicateProject = async () => {
    if (!project) return;
    const newProject = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await saveProject(newProject);
    navigate(`/?id=${newProject.id}`);
    setShowProjectMenu(false);
  };

  const handleExportZip = async () => {
    if (!project) return;
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    project.files.forEach(f => {
      zip.file(f.name, f.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setShowProjectMenu(false);
  };

  const handleShowCompilerHelp = () => {
    setShowProjectMenu(false);
    if (!showAI) setShowAI(true);
    
    // Simulate user ask
    appendMessage({
      id: Date.now().toString(),
      role: 'user',
      content: 'How do I use XeLaTeX / LuaLaTeX?',
      timestamp: Date.now()
    });

    // Simulate system response matching the requested UI
    setTimeout(() => {
      appendMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Just add\n\n\`\`\`latex\n% !TEX program = xelatex\n\`\`\`\n\nor\n\n\`\`\`latex\n% !TEX program = lualatex\n\`\`\`\n\nto the preamble of your main tex file.`,
        timestamp: Date.now() + 1
      });
    }, 500);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-primary-950 text-primary-400 animate-pulse">Loading Hermes LaTeX Environment...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen bg-primary-950 text-red-500">Failed to initialize project space.</div>;
  }

  const handleCtrlK = (pos: { top: number, left: number }, selectedText: string, from: number, to: number) => {
    setAiMenu({ top: pos.top + 8, left: pos.left, selectedText, from, to });
    setCommentDialog(null);
    setMoveFileDialog(null);
    setAiMenuPrompt("");
  };

  const handleAICommand = (type: string, prompt?: string) => {
    if (!aiMenu || !project || !activeFile) return;
    
    if (type === 'proofread') {
      sendMessage(`请结合上下文审视并校对以下内容的逻辑：\n\n\`\`\`latex\n${aiMenu.selectedText}\n\`\`\``, activeFile.content);
      if (!showAI) setShowAI(true);
    } else if (type === 'custom') {
      sendMessage(`${prompt}\n\n参考内容：\n\`\`\`latex\n${aiMenu.selectedText}\n\`\`\``, activeFile.content);
      if (!showAI) setShowAI(true);
    }
    setAiMenu(null);
  };

  const handleSaveComment = () => {
    if (!commentDialog || !activeFile) return;
    const { to } = commentDialog;
    
    const before = activeFile.content.slice(0, to);
    const after = activeFile.content.slice(to);
    const newContent = `${before}\n% [评论]: ${commentText}\n${after}`;
    
    updateFile(activeFile.id, newContent);
    setCommentDialog(null);
    setCommentText('');
  };

  const handleSaveMoveFile = async () => {
    if (!moveFileDialog || !project || !activeFile) return;
    let newName = moveFileName.trim();
    if (!newName) return;
    if (!newName.endsWith('.tex')) {
      newName += '.tex';
    }
    
    // Create new file with selected content
    const newFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: newName,
      content: moveFileDialog.selectedText,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const { from, to } = moveFileDialog;
    const before = activeFile.content.slice(0, from);
    const after = activeFile.content.slice(to);
    
    const baseName = newName.replace('.tex', '');
    const newContent = `${before}\\input{${baseName}}${after}`;
    
    const newFiles = [...project.files.map(f => f.id === activeFile.id ? { ...f, content: newContent } : f), newFile];

    const newProject = { ...project, files: newFiles, updatedAt: Date.now() };
    await saveProject(newProject);
    setMoveFileDialog(null);
    setMoveFileName('');
  };

  const handleContentChange = (content: string) => {
    if (activeFile) updateFile(activeFile.id, content);
    setAiMenu(null);
    setCommentDialog(null);
  };

  const handleCompile = async () => {
    if (!project) return;
    const mainFile = project.files.find(f => f.id === project.mainFileId);
    if (!mainFile) return;

    setIsCompiling(true);

    const filesRecord = project.files.reduce((acc, f) => {
      acc[f.name] = f.content;
      return acc;
    }, {} as Record<string, string>);

    try {
      const result = await latexApi.compile(filesRecord, mainFile.name, activeCompiler);
      if (result.success) {
        console.log(`Compiled successfully using ${activeCompiler}`);
      } else {
        console.error('Compile failed:', result.errors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Add slight artificial delay to make UI feel responsive
      setTimeout(() => setIsCompiling(false), 500);
    }
  };

  return (
    <div className="flex h-full w-full bg-primary-950 text-primary-100 font-sans overflow-hidden relative">
      {/* Ctrl+K AI Menu */}
      {aiMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAiMenu(null)} />
          <div 
            className="fixed z-50 bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl shadow-2xl p-2 w-[300px] text-primary-100 font-sans"
            style={{ top: Math.min(aiMenu.top, window.innerHeight - 200), left: Math.min(aiMenu.left, window.innerWidth - 300) }}
          >
            <div className="relative mb-2">
              <input 
                autoFocus
                className="w-full bg-[#2d2d2d] rounded-xl py-2 px-3 pr-8 text-sm text-primary-100 focus:outline-none placeholder:text-primary-500"
                placeholder="输入提示"
                value={aiMenuPrompt}
                onChange={e => setAiMenuPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && aiMenuPrompt.trim()) handleAICommand('custom', aiMenuPrompt) }}
              />
              <ArrowUp 
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer transition-colors ${aiMenuPrompt.trim() ? 'text-primary-100' : 'text-primary-600'}`} 
                onClick={() => { if(aiMenuPrompt.trim()) handleAICommand('custom', aiMenuPrompt) }} 
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <button 
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2d2d2d] rounded-xl text-sm transition-colors text-left cursor-pointer" 
                onClick={() => handleAICommand('proofread')}
              >
                <Eye className="w-4 h-4 text-primary-500" /> 校对
              </button>
              <button 
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2d2d2d] rounded-xl text-sm transition-colors text-left cursor-pointer" 
                onClick={() => {
                  setCommentDialog(aiMenu);
                  setCommentText("");
                  setAiMenu(null);
                }}
              >
                <MessageSquare className="w-4 h-4 text-primary-500" /> 留下评论
              </button>
              <button 
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2d2d2d] rounded-xl text-sm transition-colors text-left cursor-pointer" 
                onClick={() => {
                  setMoveFileDialog(aiMenu);
                  setMoveFileName("");
                  setAiMenu(null);
                }}
              >
                <FileOutput className="w-4 h-4 text-primary-500" /> 移动到文件
              </button>
            </div>
          </div>
        </>
      )}

      {/* Leave a Comment Popover */}
      {commentDialog && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCommentDialog(null)} />
          <div 
            className="fixed z-50 bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl shadow-2xl p-4 w-[340px] text-primary-100 font-sans"
            style={{ top: Math.min(commentDialog.top, window.innerHeight - 200), left: Math.min(commentDialog.left, window.innerWidth - 340) }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-white text-xs">k</div>
                <span className="font-medium text-sm">kai ma</span>
                <span className="text-xs text-primary-500">现在</span>
              </div>
              <Check className="w-4 h-4 text-primary-500" />
            </div>
            
            {commentDialog.selectedText && (
              <div className="text-xs text-primary-400 mb-4 bg-[#252525] p-2 rounded-md truncate">
                {commentDialog.selectedText}
              </div>
            )}

            <div className="border-t border-[#2d2d2d] pt-3 mb-4">
              <textarea 
                autoFocus
                className="w-full bg-transparent resize-none text-sm text-primary-100 placeholder:text-primary-500 focus:outline-none"
                placeholder="撰写评论"
                rows={2}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button className="text-sm font-medium hover:text-white transition-colors cursor-pointer" onClick={handleSaveComment}>保存</button>
              <button className="text-sm font-medium text-primary-500 hover:text-primary-300 transition-colors cursor-pointer" onClick={() => setCommentDialog(null)}>取消</button>
            </div>
          </div>
        </>
      )}

      {/* Move to File Dialog */}
      {moveFileDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-primary-900 border border-primary-800 rounded-2xl p-6 w-[420px] shadow-2xl font-sans">
            <h3 className="text-base font-bold mb-4 text-primary-50">将选区发送到文件</h3>
            <input 
              autoFocus
              className="w-full bg-primary-950 border border-primary-800 rounded-lg py-2 px-3 text-sm text-primary-100 mb-6 focus:outline-none focus:border-primary-600"
              placeholder=".tex"
              value={moveFileName}
              onChange={e => setMoveFileName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveMoveFile() }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setMoveFileDialog(null)} className="px-5 py-1.5 text-sm rounded-full bg-primary-800 text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">取消</button>
              <button onClick={handleSaveMoveFile} className="px-5 py-1.5 text-sm bg-primary-100 text-primary-950 rounded-full font-medium hover:bg-white transition-colors cursor-pointer">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-primary-900 border border-primary-800 rounded-2xl p-6 w-[420px] shadow-2xl font-sans">
            <h3 className="text-base font-bold mb-4 text-primary-50">重命名项目</h3>
            <input 
              autoFocus
              className="w-full bg-primary-950 border border-primary-800 rounded-lg py-2 px-3 text-sm text-primary-100 mb-6 focus:outline-none focus:border-primary-600"
              placeholder="Project Name"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitRename() }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRenameDialog(false)} className="px-5 py-1.5 text-sm rounded-full bg-primary-800 text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">取消</button>
              <button onClick={submitRename} className="px-5 py-1.5 text-sm bg-primary-100 text-primary-950 rounded-full font-medium hover:bg-white transition-colors cursor-pointer">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-primary-900 border border-primary-800 rounded-2xl p-6 w-[420px] shadow-2xl font-sans">
            <h3 className="text-base font-bold mb-4 text-red-400">删除项目</h3>
            <p className="text-sm text-primary-300 mb-6 leading-relaxed">
              您确定要删除此项目吗？此操作不可撤销，且所有文件将被永久删除。
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDialog(false)} className="px-5 py-1.5 text-sm rounded-full bg-primary-800 text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">取消</button>
              <button onClick={confirmDelete} className="px-5 py-1.5 text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-full font-medium transition-colors cursor-pointer">删除确认</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Nav */}
      <aside className="w-[64px] bg-primary-900 border-r border-primary-800 flex flex-col items-center py-5 gap-6 shrink-0 z-10">
        <div 
          onClick={() => togglePanel('showExplorer')}
          className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer transition-all ${settings.showExplorer ? 'bg-primary-600/20 text-primary-400' : 'text-primary-500 hover:text-primary-100 hover:bg-primary-800'}`}
          title="Toggle Explorer"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </div>
        <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer text-primary-500 hover:text-primary-100 hover:bg-primary-800 transition-all">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Header */}
        <header className="h-[48px] border-b border-primary-800 flex items-center justify-between px-4 bg-primary-900 shrink-0 relative">
          <div className="flex items-center gap-3 text-[13px] font-medium">
            <button onClick={() => navigate('/')} className="text-primary-500 hover:text-primary-100 transition-colors p-1 flex items-center" title="Go to Dashboard">
              <Home className="w-4 h-4 cursor-pointer" />
            </button>
            <span className="text-primary-500">Projects /</span>
            
            <div className="relative">
              <div 
                ref={projectTitleRef}
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
              >
                <strong>{project.name}</strong>
                {showProjectMenu ? <ChevronUp className="w-3 h-3 text-primary-400" /> : <ChevronDown className="w-3 h-3 text-primary-400" />}
              </div>

              {/* Project Dropdown Menu */}
              {showProjectMenu && (
                <div 
                  ref={projectMenuRef}
                  className="absolute top-full left-0 mt-2 w-[220px] bg-[#2a2a2a] border border-primary-800 rounded-xl shadow-2xl py-2 z-50 flex flex-col font-sans"
                >
                  <button onClick={handleRenameProject} className="flex items-center gap-3 px-4 py-2 hover:bg-[#353535] text-sm text-primary-100 transition-colors cursor-pointer text-left">
                    <Pencil className="w-4 h-4 text-primary-400" /> 重命名
                  </button>
                  <button onClick={handleDeleteProject} className="flex items-center gap-3 px-4 py-2 hover:bg-[#353535] text-sm text-primary-100 transition-colors cursor-pointer text-left">
                    <Trash className="w-4 h-4 text-primary-400" /> 删除
                  </button>
                  <button onClick={handleDuplicateProject} className="flex items-center gap-3 px-4 py-2 hover:bg-[#353535] text-sm text-primary-100 transition-colors cursor-pointer text-left">
                    <Copy className="w-4 h-4 text-primary-400" /> 复制
                  </button>
                  <button onClick={handleExportZip} className="flex items-center gap-3 px-4 py-2 hover:bg-[#353535] text-sm text-primary-100 transition-colors cursor-pointer text-left border-b border-[#353535] pb-3 mb-1">
                    <Download className="w-4 h-4 text-primary-400" /> 导出 (zip)
                  </button>
                  <button onClick={handleShowCompilerHelp} className="flex items-center gap-3 px-4 py-2 hover:bg-[#353535] text-sm text-primary-100 transition-colors cursor-pointer text-left pt-3">
                    <Sparkles className="w-4 h-4 text-primary-400" /> XeLaTeX / LuaLaTeX
                  </button>
                </div>
              )}
            </div>

            <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">NEW</span>
          </div>
          <div className="flex bg-primary-950 border border-primary-800 rounded-md p-0.5 gap-0.5">
            <button 
              onClick={() => togglePanel('showExplorer')} 
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${settings.showExplorer ? 'bg-primary-800 text-primary-100 shadow-sm' : 'text-primary-500 hover:text-primary-100 hover:bg-primary-800/50'}`}
            >
              Explorer
            </button>
            <button 
              onClick={() => togglePanel('showEditor')} 
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${settings.showEditor ? 'bg-primary-800 text-primary-100 shadow-sm' : 'text-primary-500 hover:text-primary-100 hover:bg-primary-800/50'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => togglePanel('showPreview')} 
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${settings.showPreview ? 'bg-primary-800 text-primary-100 shadow-sm' : 'text-primary-500 hover:text-primary-100 hover:bg-primary-800/50'}`}
            >
              Preview
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCompile}
              disabled={isCompiling}
              className={`text-white px-3 py-1 rounded text-xs font-semibold shadow-sm transition-colors ${
                isCompiling ? 'bg-primary-800 text-primary-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
              }`}
            >
              {isCompiling ? `Compiling (${activeCompiler})...` : 'Compile PDF'}
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 flex overflow-hidden bg-primary-950 p-2 gap-2">
          <PanelGroup direction="horizontal" id="ide-workspace-layout">
            {settings.showExplorer && (
              <>
                <Panel id="explorer-panel" order={1} defaultSize={20} minSize={10} collapsible={true}>
                  <div className="h-full rounded-lg border border-primary-800 overflow-hidden bg-primary-900">
                    <FileTree 
                      files={project.files} 
                      activeFileId={activeFile?.id || null} 
                      onSelectFile={setActiveFileId} 
                      onClose={() => togglePanel('showExplorer')}
                    />
                  </div>
                </Panel>
                <PanelResizeHandle id="explorer-resize" className="w-[8px] group bg-transparent hover:bg-primary-600/20 active:bg-primary-600/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10 rounded-full mx-1">
                  <div className="w-[2px] h-8 bg-primary-800 group-hover:bg-primary-600 group-active:bg-primary-600 rounded-full" />
                </PanelResizeHandle>
              </>
            )}

            <Panel id="main-panel" order={2} defaultSize={settings.showExplorer ? 80 : 100}>
              <div className="flex-1 flex flex-col h-full min-w-0 rounded-lg border border-primary-800 overflow-hidden bg-primary-900">
                <div className="flex-1 overflow-hidden">
                  <PanelGroup direction="horizontal" id="ide-editor-preview-layout">
                    {settings.showEditor && (
                      <Panel id="editor-panel" order={1} defaultSize={50} minSize={20}>
                        <EditorPane content={activeFile?.content || ''} onChange={handleContentChange} onCtrlK={handleCtrlK} />
                      </Panel>
                    )}
                    
                    {settings.showEditor && settings.showPreview && (
                      <PanelResizeHandle id="editor-preview-resize" className="w-[8px] group bg-transparent hover:bg-primary-600/20 active:bg-primary-600/30 transition-colors cursor-col-resize flex flex-col items-center justify-center z-10 mx-1">
                        <div className="w-[2px] h-8 bg-primary-800 group-hover:bg-primary-600 group-active:bg-primary-600 rounded-full" />
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
            <div className="rounded-lg border border-primary-800 overflow-hidden bg-primary-900 shrink-0 h-full">
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
        <footer className="h-[28px] bg-primary-900 border-t border-primary-800 flex items-center px-4 text-xs justify-between shrink-0 font-mono text-primary-500">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Connected</span>
            <span>Ln 10, Col 14</span>
            <span>UTF-8</span>
          </div>
          <div className="flex gap-6">
            <span>Compiler: {activeCompiler}</span>
            <span>Syncing...</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
