import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (pos: number) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ content, onChange, onCursorChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
          if (update.selectionSet && onCursorChange) {
            onCursorChange(update.state.selection.main.head);
          }
        }),
        EditorView.theme({
          "&": { height: "100%", backgroundColor: "#0d0d14" },
          ".cm-scroller": { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "13px", lineHeight: "1.6" },
          ".cm-gutters": { backgroundColor: "#0d0d14", color: "#475569", border: "none" },
          ".cm-activeLineGutter": { backgroundColor: "transparent" }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: content }
      });
    }
  }, [content]);

  return (
    <section className="flex flex-col h-full bg-[#0d0d14]">
      <div className="h-[32px] bg-[#14141e] border-b border-[#1e293b] flex items-center px-3 text-[11px] uppercase tracking-wider text-[#94a3b8] shrink-0">
        Editor
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </section>
  );
};
