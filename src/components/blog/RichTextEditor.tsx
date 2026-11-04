"use client";

import React, { useState } from "react";
import {
  RichTextBlock,
  RichTextBlockType,
  StructuredRichTextJSON,
} from "@/types/blog";
import { generateEntityId } from "@/lib/utils/id";
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Table as TableIcon,
  Code as CodeIcon,
  Youtube,
  Minus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  value: StructuredRichTextJSON;
  onChange: (updated: StructuredRichTextJSON) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const blocks = value?.blocks || [];

  // Undo / Redo history stacks
  const [history, setHistory] = useState<StructuredRichTextJSON[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const applyChange = (newBlocks: RichTextBlock[]) => {
    const updated: StructuredRichTextJSON = {
      version: 1,
      blocks: newBlocks,
    };
    onChange(updated);

    // Push history
    const trimmed = history.slice(0, historyIndex + 1);
    setHistory([...trimmed, updated]);
    setHistoryIndex(trimmed.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  const addBlock = (type: RichTextBlockType, level?: 1 | 2 | 3) => {
    const newBlock: RichTextBlock = {
      id: generateEntityId("b"),
      type,
      level,
      text: "",
      ordered: type === "list" ? false : undefined,
      items: type === "list" ? ["First item"] : undefined,
      tableData:
        type === "table"
          ? {
              headers: ["Feature / Spec", "Details", "Notes"],
              rows: [
                ["Item 1", "Specification A", "Included"],
                ["Item 2", "Specification B", "Optional"],
              ],
            }
          : undefined,
      language: type === "code" ? "typescript" : undefined,
    };

    applyChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<RichTextBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    applyChange(updated);
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    applyChange(updated);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    )
      return;
    const cloned = [...blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const [moved] = cloned.splice(index, 1);
    cloned.splice(targetIdx, 0, moved);
    applyChange(cloned);
  };

  return (
    <div className="space-y-4">
      {/* Top Floating Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1.5 p-2 bg-surface rounded-card border border-border shadow-xs">
        {/* Headings */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-btn border border-border">
          <button
            type="button"
            title="Heading 1"
            onClick={() => addBlock("heading", 1)}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => addBlock("heading", 2)}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => addBlock("heading", 3)}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Paragraph"
            onClick={() => addBlock("paragraph")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Pilcrow className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-btn border border-border">
          <button
            type="button"
            title="Bullet List"
            onClick={() => addBlock("list")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => {
              const b: RichTextBlock = {
                id: generateEntityId("b"),
                type: "list",
                ordered: true,
                items: ["Step 1", "Step 2"],
              };
              applyChange([...blocks, b]);
            }}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Blockquote"
            onClick={() => addBlock("blockquote")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Media & Interactive Embeds */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-btn border border-border">
          <button
            type="button"
            title="Insert Image"
            onClick={() => {
              const b: RichTextBlock = {
                id: generateEntityId("b"),
                type: "image",
                url: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=80",
                alt: "Roofing project detail",
                caption: "High quality architectural shingles installed with lifetime guarantee.",
              };
              applyChange([...blocks, b]);
            }}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Insert Table"
            onClick={() => addBlock("table")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Code Block"
            onClick={() => addBlock("code")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <CodeIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="YouTube Safe Embed"
            onClick={() => {
              const b: RichTextBlock = {
                id: generateEntityId("b"),
                type: "youtube",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                caption: "Instructional video walkthrough",
              };
              applyChange([...blocks, b]);
            }}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Youtube className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Divider Line"
            onClick={() => addBlock("divider")}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-btn border border-border ml-auto">
          <button
            type="button"
            title="Undo"
            disabled={historyIndex === 0}
            onClick={handleUndo}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-brand disabled:opacity-30 transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Canvas */}
      <div className="min-h-[400px] p-6 rounded-card border border-border bg-surface space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-xs space-y-2">
            <p>Your blog post is currently empty.</p>
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-brand text-white font-semibold hover:bg-brand-hover transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Paragraph</span>
            </button>
          </div>
        ) : (
          blocks.map((block, idx) => (
            <div
              key={block.id}
              className="group relative p-3 rounded-card border border-transparent hover:border-brand/30 hover:bg-surface-subtle/50 transition-colors"
            >
              {/* Block action bar */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-surface border border-border shadow-xs rounded-btn p-1 transition-opacity z-10">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => moveBlock(idx, "up")}
                  className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === blocks.length - 1}
                  onClick={() => moveBlock(idx, "down")}
                  className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Delete Block"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 text-text-muted hover:text-status-danger transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Block Body */}
              {block.type === "heading" && (
                <div>
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1 block">
                    Heading {block.level || 2}
                  </span>
                  <input
                    type="text"
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder={`Enter H${block.level || 2} Heading...`}
                    className={`w-full font-bold text-text-primary bg-transparent focus:outline-none focus:border-b-2 focus:border-brand ${
                      block.level === 1
                        ? "text-2xl"
                        : block.level === 3
                        ? "text-lg"
                        : "text-xl"
                    }`}
                  />
                </div>
              )}

              {block.type === "paragraph" && (
                <div>
                  <textarea
                    rows={3}
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Write detailed paragraph content..."
                    className="w-full text-xs text-text-secondary leading-relaxed bg-transparent focus:outline-none resize-y p-1 rounded focus:ring-1 focus:ring-brand/40"
                  />
                </div>
              )}

              {block.type === "blockquote" && (
                <div className="border-l-4 border-brand pl-3 py-1 italic bg-surface-subtle/60 rounded-r-btn">
                  <textarea
                    rows={2}
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="Enter inspiring quote or standout takeaway..."
                    className="w-full text-xs font-serif text-text-primary bg-transparent focus:outline-none resize-none"
                  />
                </div>
              )}

              {block.type === "list" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      {block.ordered ? "Numbered List" : "Bulleted List"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const items = block.items || [];
                        updateBlock(block.id, { items: [...items, `Item ${items.length + 1}`] });
                      }}
                      className="text-[10px] font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                  {(block.items || []).map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-2 text-xs">
                      <span className="text-text-muted font-mono w-4 text-center">
                        {block.ordered ? `${itemIdx + 1}.` : "•"}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const cloned = [...(block.items || [])];
                          cloned[itemIdx] = e.target.value;
                          updateBlock(block.id, { items: cloned });
                        }}
                        className="flex-1 px-2 py-1 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cloned = (block.items || []).filter((_, i) => i !== itemIdx);
                          updateBlock(block.id, { items: cloned });
                        }}
                        className="text-text-muted hover:text-status-danger p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {block.type === "image" && (
                <div className="space-y-3 p-3 rounded-btn border border-border bg-surface-subtle/70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={block.url || ""}
                        onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                        Alt Text (Accessibility & SEO)
                      </label>
                      <input
                        type="text"
                        value={block.alt || ""}
                        onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                        placeholder="Description of image..."
                        className="w-full px-2.5 py-1.5 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={block.caption || ""}
                      onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                      placeholder="Visible photo caption..."
                      className="w-full px-2.5 py-1.5 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs"
                    />
                  </div>

                  {block.url && (
                    <div className="relative rounded-card overflow-hidden max-h-48 border border-border flex items-center justify-center bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.url}
                        alt={block.alt || "Preview"}
                        className="max-h-48 w-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              {block.type === "youtube" && (
                <div className="space-y-2 p-3 rounded-btn border border-border bg-surface-subtle/70">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">
                      YouTube Video Embed
                    </span>
                  </div>
                  <input
                    type="url"
                    value={block.url || ""}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-2.5 py-1.5 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="Video caption or credits..."
                    className="w-full px-2.5 py-1.5 rounded bg-surface border border-border focus:outline-none focus:border-brand text-xs"
                  />
                </div>
              )}

              {block.type === "table" && (
                <div className="space-y-2 overflow-x-auto">
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    Data Table
                  </span>
                  <table className="w-full text-xs border border-border rounded overflow-hidden">
                    <thead className="bg-surface-subtle text-text-primary font-semibold">
                      <tr>
                        {(block.tableData?.headers || []).map((h, hIdx) => (
                          <th key={hIdx} className="p-2 border-b border-border text-left">
                            <input
                              type="text"
                              value={h}
                              onChange={(e) => {
                                const newHeaders = [...(block.tableData?.headers || [])];
                                newHeaders[hIdx] = e.target.value;
                                updateBlock(block.id, {
                                  tableData: {
                                    headers: newHeaders,
                                    rows: block.tableData?.rows || [],
                                  },
                                });
                              }}
                              className="w-full bg-transparent font-bold focus:outline-none"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(block.tableData?.rows || []).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-border/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const newRows = [...(block.tableData?.rows || [])];
                                  newRows[rIdx][cIdx] = e.target.value;
                                  updateBlock(block.id, {
                                    tableData: {
                                      headers: block.tableData?.headers || [],
                                      rows: newRows,
                                    },
                                  });
                                }}
                                className="w-full bg-transparent text-text-secondary focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {block.type === "code" && (
                <div className="p-3 rounded-btn bg-[#063B2E] text-mint font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-mint/60">
                    <span>Language: {block.language || "typescript"}</span>
                    <span className="uppercase">Code Snippet</span>
                  </div>
                  <textarea
                    rows={4}
                    value={block.text || ""}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    placeholder="// Write or paste code snippet here..."
                    className="w-full bg-transparent focus:outline-none text-white font-mono text-xs resize-y"
                  />
                </div>
              )}

              {block.type === "divider" && (
                <div className="py-2 flex items-center justify-center">
                  <div className="w-full h-px bg-border border-dashed" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

