"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import {
  $createCodeNode,
  $isCodeNode,
} from "@lexical/code";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
  $setBlocksType,
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link as LinkIcon,
  ChevronDown,
  Plus,
  Undo2,
  Redo2,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  FileCode,
  Minus,
  Table as TableIcon,
  Image as ImageIcon,
  Youtube,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Baseline,
  PaintBucket,
  Type,
  Subscript,
  Superscript,
  Strikethrough,
  RotateCcw,
} from "lucide-react";

const FONT_FAMILY_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
];

const COLOR_PALETTE = [
  "#000000",
  "#1f2937",
  "#4b5563",
  "#9ca3af",
  "#ffffff",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#0284c7",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

const HIGHLIGHT_PALETTE = [
  "transparent",
  "#fef08a", // soft yellow
  "#bbf7d0", // soft green
  "#bae6fd", // soft blue
  "#fbcfe8", // soft pink
  "#fed7aa", // soft orange
  "#e9d5ff", // soft purple
];

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Formatting state
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [fontSize, setFontSize] = useState<number>(15);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [alignment, setAlignment] = useState<string>("left");
  const [textColor, setTextColor] = useState<string>("#1f2937");
  const [bgColor, setBgColor] = useState<string>("transparent");

  // Dropdown visibility states
  const [activeDropdown, setActiveDropdown] = useState<
    "block" | "font" | "color" | "bg" | "format" | "insert" | "align" | null
  >(null);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: typeof activeDropdown) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      // Font Family & Size from inline styles
      const ff = $getSelectionStyleValueForProperty(selection, "font-family", "Arial, sans-serif");
      const matchedFont = FONT_FAMILY_OPTIONS.find((f) => f.value === ff || ff.includes(f.label));
      setFontFamily(matchedFont ? matchedFont.label : "Arial");

      const fs = $getSelectionStyleValueForProperty(selection, "font-size", "15px");
      const numericSize = parseInt(fs, 10);
      if (!isNaN(numericSize)) setFontSize(numericSize);

      // Colors
      const color = $getSelectionStyleValueForProperty(selection, "color", "#1f2937");
      setTextColor(color);
      const bg = $getSelectionStyleValueForProperty(selection, "background-color", "transparent");
      setBgColor(bg);

      // Link Detection
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Block Type Detection
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if ($isCodeNode(element)) {
            setBlockType("code");
          } else {
            setBlockType(type);
          }
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  // Block Formatting Handlers
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
    setBlockType("paragraph");
    setActiveDropdown(null);
  };

  const formatHeading = (tag: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
    setBlockType(tag);
    setActiveDropdown(null);
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    setBlockType("bullet");
    setActiveDropdown(null);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    setBlockType("number");
    setActiveDropdown(null);
  };

  const formatCheckList = () => {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    setBlockType("check");
    setActiveDropdown(null);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
    setBlockType("quote");
    setActiveDropdown(null);
  };

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
    setBlockType("code");
    setActiveDropdown(null);
  };

  // Font family & size
  const applyFontFamily = (val: string, label: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-family": val });
      }
    });
    setFontFamily(label);
    setActiveDropdown(null);
  };

  const updateFontSize = (newSize: number) => {
    const clamped = Math.max(8, Math.min(72, newSize));
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "font-size": `${clamped}px` });
      }
    });
    setFontSize(clamped);
  };

  // Color application
  const applyTextColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
    setTextColor(color);
    setActiveDropdown(null);
  };

  const applyBgColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": color });
      }
    });
    setBgColor(color);
    setActiveDropdown(null);
  };

  // Link Toggle
  const handleLink = () => {
    if (!isLink) {
      const url = prompt("Enter link URL (e.g. https://example.com):");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  // Insert items
  const handleInsertHR = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    setActiveDropdown(null);
  };

  const handleInsertTable = () => {
    const rows = prompt("Number of table rows:", "3") || "3";
    const cols = prompt("Number of table columns:", "3") || "3";
    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);
    if (!isNaN(numRows) && !isNaN(numCols) && numRows > 0 && numCols > 0) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: String(numRows),
        columns: String(numCols),
        includeHeaders: true,
      });
    }
    setActiveDropdown(null);
  };

  const handleInsertImage = () => {
    const url = prompt("Enter Image URL (e.g. https://images.unsplash.com/...):");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const p = $createParagraphNode();
          selection.insertNodes([p]);
        }
      });
    }
    setActiveDropdown(null);
  };

  const handleInsertYouTube = () => {
    const url = prompt("Enter YouTube video link (e.g. https://www.youtube.com/watch?v=...):");
    if (url) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const vidId = match ? match[1] : null;
      if (vidId) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const p = $createParagraphNode();
            p.append(
              $createParagraphNode()
            );
          }
        });
      } else {
        alert("Invalid YouTube URL. Please provide a valid YouTube link.");
      }
    }
    setActiveDropdown(null);
  };

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          "font-family": "",
          "font-size": "15px",
          color: "",
          "background-color": "",
        });
        if (selection.hasFormat("bold")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        if (selection.hasFormat("italic")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        if (selection.hasFormat("underline")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        if (selection.hasFormat("strikethrough")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        if (selection.hasFormat("subscript")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        if (selection.hasFormat("superscript")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        if (selection.hasFormat("code")) editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
      }
    });
    setActiveDropdown(null);
  };

  const getBlockTypeLabel = () => {
    switch (blockType) {
      case "h1":
        return "Heading 1";
      case "h2":
        return "Heading 2";
      case "h3":
        return "Heading 3";
      case "bullet":
        return "Bullet List";
      case "number":
        return "Numbered List";
      case "check":
        return "Check List";
      case "quote":
        return "Quote";
      case "code":
        return "Code Block";
      default:
        return "Normal";
    }
  };

  const getAlignLabel = () => {
    switch (alignment) {
      case "center":
        return "Center Align";
      case "right":
        return "Right Align";
      case "justify":
        return "Justify";
      default:
        return "Left Align";
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="flex items-center overflow-x-auto gap-1 px-2.5 py-1.5 bg-surface-subtle/50 border-b border-border text-xs rounded-t-card select-none"
    >
      {/* 1. Undo & Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          disabled={!canUndo}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            canUndo
              ? "hover:bg-surface text-text-primary hover:border hover:border-border/60"
              : "text-text-muted opacity-30 cursor-not-allowed"
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          disabled={!canRedo}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            canRedo
              ? "hover:bg-surface text-text-primary hover:border hover:border-border/60"
              : "text-text-muted opacity-30 cursor-not-allowed"
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-border/80 mx-0.5 shrink-0" />

      {/* 2. Block Type Dropdown (Normal ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("block")}
          className="h-7 flex items-center gap-1 px-2 rounded border border-border/80 bg-surface hover:bg-surface-subtle text-text-primary font-medium text-xs transition-colors shadow-2xs"
          title="Block Format"
        >
          <Pilcrow className="w-3 h-3 text-text-muted" />
          <span className="truncate max-w-[85px]">{getBlockTypeLabel()}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {activeDropdown === "block" && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 space-y-0.5">
            <button
              type="button"
              onClick={formatParagraph}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "paragraph" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Pilcrow className="w-3.5 h-3.5" />
              <span>Normal</span>
            </button>
            <button
              type="button"
              onClick={() => formatHeading("h1")}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "h1" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Heading1 className="w-3.5 h-3.5" />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={() => formatHeading("h2")}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "h2" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={() => formatHeading("h3")}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "h3" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>Heading 3</span>
            </button>
            <button
              type="button"
              onClick={formatBulletList}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "bullet" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bullet List</span>
            </button>
            <button
              type="button"
              onClick={formatNumberedList}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "number" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Numbered List</span>
            </button>
            <button
              type="button"
              onClick={formatCheckList}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "check" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Check List</span>
            </button>
            <button
              type="button"
              onClick={formatQuote}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "quote" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Quote</span>
            </button>
            <button
              type="button"
              onClick={formatCodeBlock}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                blockType === "code" ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code Block</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Font Family Dropdown (T Arial ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("font")}
          className="h-7 flex items-center gap-1 px-2 rounded border border-border/80 bg-surface hover:bg-surface-subtle text-text-primary font-medium text-xs transition-colors shadow-2xs"
          title="Font Family"
        >
          <Type className="w-3 h-3 text-text-muted" />
          <span className="truncate max-w-[70px]">{fontFamily}</span>
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {activeDropdown === "font" && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 max-h-60 overflow-y-auto">
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => applyFontFamily(opt.value, opt.label)}
                style={{ fontFamily: opt.value }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-surface-subtle ${
                  fontFamily === opt.label ? "font-bold text-brand bg-mint/30" : "text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Font Size Stepper (- 15 +) */}
      <div className="flex items-center border border-border/80 rounded bg-surface h-7 shrink-0 shadow-2xs">
        <button
          type="button"
          onClick={() => updateFontSize(fontSize - 1)}
          className="px-1.5 h-full hover:bg-surface-subtle text-text-secondary transition-colors"
          title="Decrease font size"
        >
          -
        </button>
        <span className="px-1.5 text-[11px] font-mono font-semibold text-text-primary min-w-[20px] text-center">
          {fontSize}
        </span>
        <button
          type="button"
          onClick={() => updateFontSize(fontSize + 1)}
          className="px-1.5 h-full hover:bg-surface-subtle text-text-secondary transition-colors"
          title="Increase font size"
        >
          +
        </button>
      </div>

      <div className="h-4 w-px bg-border/80 mx-0.5 shrink-0" />

      {/* 5. Inline Formatting (B, I, U, <>, Link) */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            isBold
              ? "bg-brand/15 text-brand border border-brand/30 font-bold"
              : "text-text-secondary hover:bg-surface hover:text-text-primary"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            isItalic
              ? "bg-brand/15 text-brand border border-brand/30 font-bold"
              : "text-text-secondary hover:bg-surface hover:text-text-primary"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            isUnderline
              ? "bg-brand/15 text-brand border border-brand/30 font-bold"
              : "text-text-secondary hover:bg-surface hover:text-text-primary"
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            isCode
              ? "bg-brand/15 text-brand border border-brand/30 font-bold"
              : "text-text-secondary hover:bg-surface hover:text-text-primary"
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            isLink
              ? "bg-brand/15 text-brand border border-brand/30 font-bold"
              : "text-text-secondary hover:bg-surface hover:text-text-primary"
          }`}
          title={isLink ? "Remove Link" : "Insert Link"}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Text Color Picker (A ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("color")}
          className="h-7 px-1.5 flex items-center gap-0.5 rounded hover:bg-surface text-text-primary transition-colors"
          title="Text Color"
        >
          <div className="flex flex-col items-center">
            <Baseline className="w-3.5 h-3.5" />
            <span
              className="w-3 h-0.5 rounded-full mt-0.5"
              style={{ backgroundColor: textColor || "#000000" }}
            />
          </div>
          <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
        </button>

        {activeDropdown === "color" && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-surface border border-border rounded-lg shadow-lg z-30 w-44">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">Text Color</div>
            <div className="grid grid-cols-5 gap-1.5">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyTextColor(c)}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Background Color / Highlight (🪣 ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("bg")}
          className="h-7 px-1.5 flex items-center gap-0.5 rounded hover:bg-surface text-text-primary transition-colors"
          style={{ backgroundColor: bgColor !== "transparent" ? bgColor : undefined }}
          title="Highlight Color"
        >
          <PaintBucket className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
        </button>

        {activeDropdown === "bg" && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-surface border border-border rounded-lg shadow-lg z-30 w-40">
            <div className="text-[10px] font-bold text-text-muted uppercase mb-1.5">Highlight</div>
            <div className="grid grid-cols-4 gap-1.5">
              {HIGHLIGHT_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyBgColor(c)}
                  className={`w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center text-[10px] ${
                    c === "transparent" ? "bg-surface text-text-muted font-bold" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  title={c === "transparent" ? "No highlight" : c}
                >
                  {c === "transparent" ? "✕" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Advanced Formats (Aa ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("format")}
          className="h-7 px-1.5 flex items-center gap-0.5 rounded hover:bg-surface text-text-primary text-xs font-semibold transition-colors"
          title="More Text Formatting"
        >
          <span>Aa</span>
          <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
        </button>

        {activeDropdown === "format" && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                setActiveDropdown(null);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                isStrikethrough ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
              <span>Strikethrough</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
                setActiveDropdown(null);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                isSubscript ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Subscript className="w-3.5 h-3.5" />
              <span>Subscript</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
                setActiveDropdown(null);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle ${
                isSuperscript ? "font-bold text-brand bg-mint/30" : "text-text-primary"
              }`}
            >
              <Superscript className="w-3.5 h-3.5" />
              <span>Superscript</span>
            </button>
            <div className="h-px bg-border my-1" />
            <button
              type="button"
              onClick={handleClearFormatting}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-rose-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Formatting</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-border/80 mx-0.5 shrink-0" />

      {/* 9. + Insert ⌄ Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("insert")}
          className="h-7 flex items-center gap-1 px-2 rounded border border-brand/30 bg-mint/40 hover:bg-mint/60 text-[#063B2E] font-semibold text-xs transition-colors shadow-2xs"
          title="Insert Element"
        >
          <Plus className="w-3 h-3 text-brand" />
          <span>Insert</span>
          <ChevronDown className="w-2.5 h-2.5 text-[#063B2E]" />
        </button>

        {activeDropdown === "insert" && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 space-y-0.5">
            <button
              type="button"
              onClick={handleInsertHR}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <Minus className="w-3.5 h-3.5 text-text-muted" />
              <span>Horizontal Rule</span>
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <TableIcon className="w-3.5 h-3.5 text-text-muted" />
              <span>Table (Custom Grid)</span>
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <ImageIcon className="w-3.5 h-3.5 text-text-muted" />
              <span>Image from URL</span>
            </button>
            <button
              type="button"
              onClick={handleInsertYouTube}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <Youtube className="w-3.5 h-3.5 text-rose-600" />
              <span>YouTube Video</span>
            </button>
            <button
              type="button"
              onClick={formatQuote}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <Quote className="w-3.5 h-3.5 text-text-muted" />
              <span>Blockquote Callout</span>
            </button>
            <button
              type="button"
              onClick={formatCodeBlock}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <FileCode className="w-3.5 h-3.5 text-text-muted" />
              <span>Code Snippet</span>
            </button>
          </div>
        )}
      </div>

      {/* 10. Alignment & Indent Dropdown (≡ Left Align ⌄) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggleDropdown("align")}
          className="h-7 flex items-center gap-1 px-2 rounded border border-border/80 bg-surface hover:bg-surface-subtle text-text-primary font-medium text-xs transition-colors shadow-2xs"
          title="Alignment & Indentation"
        >
          <AlignLeft className="w-3 h-3 text-text-muted" />
          <span className="truncate max-w-[80px]">{getAlignLabel()}</span>
          <ChevronDown className="w-2.5 h-2.5 text-text-muted" />
        </button>

        {activeDropdown === "align" && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-30 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                setAlignment("left");
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Left Align</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                setAlignment("center");
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <AlignCenter className="w-3.5 h-3.5" />
              <span>Center Align</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                setAlignment("right");
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <AlignRight className="w-3.5 h-3.5" />
              <span>Right Align</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
                setAlignment("justify");
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Justify</span>
            </button>
            <div className="h-px bg-border my-1" />
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <Outdent className="w-3.5 h-3.5" />
              <span>Outdent</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                setActiveDropdown(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-subtle text-text-primary"
            >
              <Indent className="w-3.5 h-3.5" />
              <span>Indent</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
