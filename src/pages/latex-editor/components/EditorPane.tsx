import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (pos: number) => void;
  onCtrlK?: (pos: { top: number, left: number }, selectedText: string, from: number, to: number) => void;
}

// Custom IDE Theme for CodeMirror
const ideTheme = EditorView.theme({
  "&": {
    color: "var(--color-primary-100)",
    backgroundColor: "var(--color-primary-900)",
    height: "100%"
  },
  ".cm-scroller": { fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: "1.6" },
  ".cm-content": {
    caretColor: "var(--color-primary-400)"
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-primary-400)", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "rgba(59, 130, 246, 0.3)" },
  ".cm-panels": { backgroundColor: "var(--color-primary-800)", color: "var(--color-primary-100)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--color-primary-800)" },
  ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--color-primary-800)" },
  ".cm-searchMatch": {
    backgroundColor: "rgba(245, 158, 11, 0.3)",
    outline: "1px solid #F59E0B"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(245, 158, 11, 0.5)"
  },
  ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.03)" },
  ".cm-selectionMatch": { backgroundColor: "rgba(16, 185, 129, 0.2)" },
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-primary-900)",
    color: "var(--color-primary-500)",
    borderRight: "1px solid var(--color-primary-800)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    color: "var(--color-primary-100)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 16px 0 12px" }
}, { dark: true });

const ideHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#FF7B72" }, // Reddish
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "#79C0FF" }, // Light Blue
  { tag: [t.function(t.variableName), t.labelName], color: "#D2A8FF" }, // Purple
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#79C0FF" },
  { tag: [t.definition(t.name), t.separator], color: "var(--color-primary-100)" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "#FFA657" }, // Orange
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#79C0FF" },
  { tag: [t.meta, t.comment], color: "var(--color-primary-500)", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "var(--color-primary-400)", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "var(--color-primary-400)" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#A5D6FF" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "#A5D6FF" }, // Light Blue string
  { tag: t.invalid, color: "#EF4444" },
]);

export const EditorPane: React.FC<EditorPaneProps> = ({ content, onChange, onCursorChange, onCtrlK }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const customKeymap = keymap.of([
      {
        key: 'Mod-k',
        preventDefault: true,
        run: (view) => {
          if (onCtrlK) {
            const sel = view.state.selection.main;
            const selectedText = view.state.doc.sliceString(sel.from, sel.to);
            let targetPos = sel.empty ? sel.head : sel.from;
            const coords = view.coordsAtPos(targetPos);
            if (coords) {
              onCtrlK({ top: coords.bottom, left: coords.left }, selectedText, sel.from, sel.to);
            }
          }
          return true;
        }
      }
    ]);

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
        customKeymap,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        ideTheme,
        syntaxHighlighting(ideHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
          if (update.selectionSet && onCursorChange) {
            onCursorChange(update.state.selection.main.head);
          }
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
  }, [onCtrlK]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: content }
      });
    }
  }, [content]);

  return (
    <section className="flex flex-col h-full bg-primary-900 font-mono">
      <div className="h-[40px] bg-primary-800 border-b border-primary-800 flex items-center px-4 text-xs font-medium text-primary-100 shrink-0 font-sans">
        Editor
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </section>
  );
};
