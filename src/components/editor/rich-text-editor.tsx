"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
  minHeight = "280px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 text-[#171717] min-h-[220px]",
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        className="w-full border border-gray-200 rounded-2xl bg-gray-50/50 p-4 animate-pulse text-xs text-gray-400"
        style={{ minHeight }}
      >
        Loading rich text editor...
      </div>
    );
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const addHorizontalRule = () => editor.chain().focus().setHorizontalRule().run();

  return (
    <div className="w-full border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-200 text-gray-700">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("bold") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleItalic}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("italic") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleStrike}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("strike") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={toggleH2}
          className={`px-2 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#00E500] text-black font-bold"
              : "text-gray-700"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={toggleH3}
          className={`px-2 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#00E500] text-black font-bold"
              : "text-gray-700"
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
          <span>H3</span>
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("orderedList") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleBlockquote}
          className={`p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors ${
            editor.isActive("blockquote") ? "bg-[#00E500] text-black font-bold" : "text-gray-700"
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={addHorizontalRule}
          className="p-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 text-gray-700 transition-colors"
          title="Divider line"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Surface */}
      <div style={{ minHeight }} className="cursor-text bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
