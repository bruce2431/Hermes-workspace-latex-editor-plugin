import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  List, 
  Grid, 
  ChevronDown, 
  Plus, 
  MoreHorizontal,
  FileText,
  X
} from 'lucide-react';
import * as db from '@/lib/db';
import { LatexProject } from '@/types/latex';
import JSZip from 'jszip';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<LatexProject[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // Custom dialog state to avoid iframe restrictions on alert/prompt
  const [renameDialogId, setRenameDialogId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = async () => {
    const all = await db.getProjects();
    setProjects(all);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenProject = (id: string) => {
    navigate(`/editor?id=${id}`);
  };

  const handleCreateNew = async () => {
    const newProject: LatexProject = {
      id: Date.now().toString(),
      name: 'Untitled',
      files: [{
        id: 'main',
        name: 'main.tex',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content: `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}

% Core packages
\\usepackage{amsmath,amssymb}
\\usepackage{tikz-cd}
\\usepackage{multicol}

% Paragraphs
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{1\\baselineskip}

\\title{Untitled}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}

\\end{document}`
      }],
      mainFileId: 'main',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.saveProject(newProject);
    navigate(`/editor?id=${newProject.id}`);
  };

  const handleDelete = async (id: string) => {
    await db.deleteProject(id);
    setMenuOpenId(null);
    loadProjects();
  };

  const openRenameDialog = (id: string) => {
    const p = projects.find(p => p.id === id);
    if (p) {
      setRenameValue(p.name);
      setRenameDialogId(id);
      setMenuOpenId(null);
    }
  };

  const submitRename = async () => {
    if (!renameDialogId) return;
    const p = projects.find(p => p.id === renameDialogId);
    if (!p) return;
    
    if (renameValue && renameValue.trim()) {
      p.name = renameValue.trim();
      p.updatedAt = Date.now();
      await db.saveProject(p);
      loadProjects();
    }
    setRenameDialogId(null);
  };

  const handleDuplicate = async (id: string) => {
    const p = projects.find(p => p.id === id);
    if (!p) return;
    const duplicated: LatexProject = {
      ...p,
      id: Date.now().toString(),
      name: p.name + ' (Copy)',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.saveProject(duplicated);
    setMenuOpenId(null);
    loadProjects();
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const newFiles = [];
      for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
        if (!zipEntry.dir) {
          const content = await zipEntry.async("string");
          newFiles.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: relativePath.split('/').pop() || relativePath,
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }
      }

      if (newFiles.length === 0) {
        setErrorMsg("压缩包内没有找到可供导入的文件。");
        return;
      }

      // Try to find a main.tex, else use the first one
      const mainFile = newFiles.find(f => f.name.toLowerCase() === 'main.tex') || newFiles[0];

      const newProject: LatexProject = {
        id: Date.now().toString(),
        name: file.name.replace('.zip', ''),
        files: newFiles,
        mainFileId: mainFile.id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await db.saveProject(newProject);
      navigate(`/editor?id=${newProject.id}`);
    } catch (err) {
      console.error("Failed to parse zip", err);
      setErrorMsg("导入失败，请确保它是一个包含文本源代码的有效 ZIP 压缩包。");
    }
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Close menus when clicking outside
  useEffect(() => {
    const clickHandler = () => setMenuOpenId(null);
    window.addEventListener('click', clickHandler);
    return () => window.removeEventListener('click', clickHandler);
  }, []);

  const formatDistance = (ms: number) => {
    const diff = Date.now() - ms;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days < 30) return `${days}天前`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}个月前`;
    return `${Math.floor(months / 12)}年前`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-primary-950 text-primary-100 font-sans p-8">
      {/* Toast ErrorMsg */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-900 border border-red-500 text-red-100 px-4 py-2 rounded-lg flex items-center shadow-lg">
          {errorMsg}
          <button className="ml-4 hover:text-white" onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDialogId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-primary-900 border border-primary-800 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">重命名项目</h3>
            <input 
              type="text" 
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              className="w-full bg-primary-950 border border-primary-700 rounded-md py-2 px-3 text-primary-100 mb-6 focus:outline-none focus:border-primary-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && submitRename()}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRenameDialogId(null)} className="px-4 py-1.5 rounded-md hover:bg-primary-800 transition-colors">取消</button>
              <button onClick={submitRename} className="px-4 py-1.5 bg-primary-100 text-primary-950 rounded-md font-medium hover:bg-white transition-colors">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold tracking-wide">你的项目</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 group-focus-within:text-primary-400" />
            <input 
              type="text" 
              placeholder="搜索" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-primary-900 border border-primary-800 rounded-full py-1.5 pl-9 pr-4 text-sm text-primary-100 focus:outline-none focus:border-primary-600 transition-colors w-64 shadow-sm placeholder:text-primary-500"
            />
          </div>

          <div className="flex items-center bg-primary-900 rounded-lg p-0.5 border border-primary-800 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-primary-800 text-primary-100' : 'text-primary-500 hover:text-primary-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-primary-800 text-primary-100' : 'text-primary-500 hover:text-primary-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input 
              type="file" 
              accept=".zip" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImportZip} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-primary-900 border border-primary-800 hover:bg-primary-800 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
              导入 <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 bg-primary-100 text-primary-950 hover:bg-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建 <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-4 mb-4 px-4 text-xs font-medium text-primary-500 tracking-wider">
            <div className="flex items-center cursor-pointer hover:text-primary-400 transition-colors">
              名称 <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70 inline" />
            </div>
            <div className="flex items-center w-[120px] justify-between cursor-pointer hover:text-primary-400 transition-colors">
              创建时间 <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70 inline" />
            </div>
          </div>
          <div className="w-full h-px bg-primary-800 mb-2" />
        </>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-primary-500 gap-4">
            <FileText className="w-12 h-12 opacity-20" />
            <p>没有找到项目，点击"新建"创建一个。</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col">
            {filteredProjects.map((proj, idx) => (
              <React.Fragment key={proj.id}>
                <div 
                  className="grid grid-cols-[1fr_auto] gap-4 py-3 px-4 items-center group hover:bg-primary-900/50 rounded-lg transition-colors"
                >
                  <div 
                    onClick={() => handleOpenProject(proj.id)}
                    className="flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-8 h-10 bg-primary-900 border border-primary-800 flex items-center justify-center rounded-sm shrink-0 group-hover:border-primary-600 transition-colors shadow-sm">
                      <FileText className="w-4 h-4 text-primary-400" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary-50 transition-colors">{proj.name}</span>
                  </div>
                  <div className="flex items-center w-[120px] justify-between relative">
                    <span className="text-sm text-primary-500">{formatDistance(proj.createdAt)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === proj.id ? null : proj.id); }}
                      className="text-primary-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-primary-100 transition-all p-1 cursor-pointer rounded-full hover:bg-primary-800"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {menuOpenId === proj.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-primary-800 border border-primary-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openRenameDialog(proj.id)} className="w-full text-left px-4 py-2 text-sm text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">重命名</button>
                        <button onClick={() => handleDuplicate(proj.id)} className="w-full text-left px-4 py-2 text-sm text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">复制</button>
                        <button onClick={() => handleDelete(proj.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary-700 transition-colors cursor-pointer">删除</button>
                      </div>
                    )}
                  </div>
                </div>
                {idx < filteredProjects.length - 1 && <div className="w-full h-px bg-primary-800/50 ml-4" />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-4">
            {filteredProjects.map((proj) => (
              <div key={proj.id} className="flex flex-col gap-3 group relative">
                <div 
                  onClick={() => handleOpenProject(proj.id)}
                  className="aspect-[3/4] bg-primary-900 border border-primary-800 rounded-lg cursor-pointer hover:border-primary-600 transition-colors shadow-sm flex items-center justify-center p-4 relative"
                >
                  <FileText className="w-12 h-12 text-primary-500 opacity-50 block mx-auto group-hover:text-primary-400 group-hover:opacity-100 transition-colors" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm font-medium text-primary-100 truncate w-full">{proj.name}</span>
                  <span className="text-xs text-primary-500 mt-1">{formatDistance(proj.createdAt)}</span>
                </div>
                
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === proj.id ? null : proj.id); }}
                    className="text-primary-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-primary-100 transition-all p-1.5 cursor-pointer rounded-full bg-primary-950/80 hover:bg-primary-800 shadow-sm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuOpenId === proj.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-primary-800 border border-primary-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openRenameDialog(proj.id)} className="w-full text-left px-4 py-2 text-sm text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">重命名</button>
                      <button onClick={() => handleDuplicate(proj.id)} className="w-full text-left px-4 py-2 text-sm text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer">复制</button>
                      <button onClick={() => handleDelete(proj.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary-700 transition-colors cursor-pointer">删除</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
