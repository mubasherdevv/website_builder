"use client";

import React, { useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { TRANSFORMERS } from "@lexical/markdown";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  EditorState,
  LexicalEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";

import { StructuredRichTextJSON, RichTextBlock } from "@/types/blog";
import { lexicalTheme } from "./LexicalTheme";
import { ToolbarPlugin } from "./ToolbarPlugin";

interface LexicalBlogEditorProps {
  value: StructuredRichTextJSON;
  onChange: (updated: StructuredRichTextJSON) => void;
  placeholder?: string;
}

export const LexicalBlogEditor: React.FC<LexicalBlogEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your article with rich typography, headings, lists, and markdown shortcuts...",
}) => {
  // Initial editor state preparation
  const initialConfig = useMemo(() => {
    return {
      namespace: "SecureSiteBlogEditor",
      theme: lexicalTheme,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        HorizontalRuleNode,
      ],
      onError: (error: Error) => {
        console.error("Lexical Editor Error:", error);
      },
      editorState: (editor: LexicalEditor) => {
        // If we already have serialized lexicalState, load it
        if (value?.lexicalState) {
          try {
            const parsedState = editor.parseEditorState(value.lexicalState);
            editor.setEditorState(parsedState);
            return;
          } catch (e) {
            console.warn("Could not parse existing lexical state, rebuilding from blocks:", e);
          }
        }

        // Otherwise seed from value.blocks
        const root = $getRoot();
        root.clear();

        const blocks = value?.blocks || [];
        if (blocks.length === 0) {
          const p = $createParagraphNode();
          p.append($createTextNode(""));
          root.append(p);
          return;
        }

        for (const block of blocks) {
          if (block.type === "heading") {
            const tag = block.level === 1 ? "h1" : block.level === 3 ? "h3" : "h2";
            const h = $createHeadingNode(tag);
            h.append($createTextNode(block.text || ""));
            root.append(h);
          } else {
            const p = $createParagraphNode();
            p.append($createTextNode(block.text || ""));
            root.append(p);
          }
        }
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
    editor.update(() => {
      // 1. Serialize lexical editor state
      const serializedState = JSON.stringify(editorState.toJSON());

      // 2. Generate clean semantic HTML
      const html = $generateHtmlFromNodes(editor, null);

      // 3. Generate fallback blocks for backward compatibility
      const fallbackBlocks: RichTextBlock[] = [];
      const root = $getRoot();
      const children = root.getChildren();

      children.forEach((child, idx) => {
        const text = child.getTextContent();
        const type = child.getType();

        if (type === "heading") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const tag = (child as any).getTag?.() || "h2";
          const level = tag === "h1" ? 1 : tag === "h3" ? 3 : 2;
          fallbackBlocks.push({
            id: `lex_b_${idx + 1}`,
            type: "heading",
            level,
            text,
          });
        } else if (type === "quote") {
          fallbackBlocks.push({
            id: `lex_b_${idx + 1}`,
            type: "blockquote",
            text,
          });
        } else if (type === "code") {
          fallbackBlocks.push({
            id: `lex_b_${idx + 1}`,
            type: "code",
            text,
          });
        } else {
          fallbackBlocks.push({
            id: `lex_b_${idx + 1}`,
            type: "paragraph",
            text,
          });
        }
      });

      onChange({
        version: 1,
        blocks: fallbackBlocks.length > 0 ? fallbackBlocks : value.blocks,
        html,
        lexicalState: serializedState,
      });
    });
  };

  return (
    <div className="rounded-card border border-border bg-surface shadow-xs transition-colors focus-within:border-brand/70 overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="flex flex-col">
          {/* Rich Format Toolbar */}
          <ToolbarPlugin />

          {/* Editable Content Area */}
          <div className="relative min-h-[320px] p-4 sm:p-6 bg-surface text-text-primary">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="outline-none min-h-[300px] prose prose-slate dark:prose-invert max-w-none text-text-primary"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-text-muted text-sm sm:text-base pointer-events-none select-none italic">
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <TablePlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={handleEditorChange} />
          </div>

          {/* Quick Markdown & Keyboard Hints Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border bg-surface-subtle/50 text-[11px] text-text-muted">
            <div className="flex items-center gap-3">
              <span>
                <strong className="text-text-primary">Markdown:</strong> Type <code className="px-1 bg-surface border border-border rounded"># </code> for H1, <code className="px-1 bg-surface border border-border rounded">## </code> for H2, <code className="px-1 bg-surface border border-border rounded">- </code> for list
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-mint text-[#063B2E] font-medium text-[10px]">
                Lexical Engine Active
              </span>
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};
