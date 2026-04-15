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
}

// Custom Hermes Theme for CodeMirror
const hermesTheme = EditorView.theme({
  "&": {
    color: "var(--color-hermes-fg)",
    backgroundColor: "var(--color-hermes-bg)",
    height: "100%"
  },
  ".cm-scroller": { fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: "1.6" },
  ".cm-content": {
    caretColor: "var(--color-hermes-warning)"
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-hermes-warning)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "var(--color-hermes-fg)", color: "var(--color-hermes-bg)" },
  ".cm-panels": { backgroundColor: "var(--color-hermes-card)", color: "var(--color-hermes-fg)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--color-hermes-border)" },
  ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--color-hermes-border)" },
  ".cm-searchMatch": {
    backgroundColor: "rgba(255, 189, 56, 0.3)",
    outline: "1px solid var(--color-hermes-warning)"
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(255, 189, 56, 0.5)"
  },
  ".cm-activeLine": { backgroundColor: "var(--color-hermes-card-hover)" },
  ".cm-selectionMatch": { backgroundColor: "rgba(74, 222, 128, 0.2)" },
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "rgba(255, 230, 203, 0.2)"
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-hermes-bg)",
    color: "var(--color-hermes-fg)",
    borderRight: "1px solid var(--color-hermes-border)",
    opacity: 0.5
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-hermes-card-hover)",
    color: "var(--color-hermes-warning)",
    opacity: 1
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 14px 0 8px" }
}, { dark: true });

const hermesHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "var(--color-hermes-warning)" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "var(--color-hermes-success)" },
  { tag: [t.function(t.variableName), t.labelName], color: "var(--color-hermes-warning)" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "var(--color-hermes-warning)" },
  { tag: [t.definition(t.name), t.separator], color: "var(--color-hermes-fg)" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "var(--color-hermes-success)" },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "var(--color-hermes-error)" },
  { tag: [t.meta, t.comment], color: "var(--color-hermes-fg)", opacity: 0.5, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "var(--color-hermes-warning)", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "var(--color-hermes-warning)" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "var(--color-hermes-success)" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "var(--color-hermes-success)" },
  { tag: t.invalid, color: "var(--color-hermes-error)" },
]);

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
        hermesTheme,
        syntaxHighlighting(hermesHighlightStyle),
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
  }, []);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: content }
      });
    }
  }, [content]);

  return (
    <section className="flex flex-col h-full bg-hermes-bg font-mono">
      <div className="h-[32px] bg-hermes-card border-b border-hermes-border flex items-center px-3 text-[11px] uppercase tracking-wider text-hermes-fg/60 shrink-0">
        Editor
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </section>
  );
};
