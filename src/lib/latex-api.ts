import { CompileResult } from '@/types/latex';

const API_BASE = '/api/latex';

export const latexApi = {
  /**
   * Compile LaTeX project to PDF
   */
  async compile(files: Record<string, string>, mainFile: string, compiler: string = 'pdflatex'): Promise<CompileResult> {
    try {
      const res = await fetch(`${API_BASE}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, mainFile, compiler })
      });
      if (!res.ok) throw new Error('Compile failed');
      return await res.json();
    } catch (error) {
      console.error('Compile error:', error);
      return { success: false, logs: String(error), errors: [{ message: 'Network or server error', raw: String(error) }] };
    }
  },

  /**
   * AI Assist Stream (SSE)
   */
  async aiAssistStream(prompt: string, context: string, onMessage: (chunk: string) => void): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/ai-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      
      if (!res.body) throw new Error('No response body');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) onMessage(parsed.text);
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Assist error:', error);
      throw error;
    }
  }
};
