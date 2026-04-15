export type EditorViewMode = 'split' | 'editor-only' | 'preview-only';

export interface LatexFile {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  timestamp: number;
  snapshot: Record<string, string>; // fileId -> content
  description?: string;
}

export interface LatexProject {
  id: string;
  name: string;
  files: LatexFile[];
  mainFileId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
}

export interface EditorSettings {
  fontSize: number;
  wordWrap: boolean;
  showExplorer: boolean;
  showEditor: boolean;
  showPreview: boolean;
  autoCompile: boolean;
}

export interface CompileError {
  line?: number;
  message: string;
  raw: string;
}

export interface CompileResult {
  pdfUrl?: string;
  success: boolean;
  errors?: CompileError[];
  logs: string;
}

export interface LatexSymbol {
  command: string;
  display: string;
  description: string;
}

export interface SymbolCategory {
  name: string;
  symbols: LatexSymbol[];
}
