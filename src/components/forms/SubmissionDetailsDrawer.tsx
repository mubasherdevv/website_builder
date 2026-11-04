"use client";

import React, { useState } from "react";
import {
  FormSubmission,
  SubmissionStatus,
} from "@/types/forms";
import {
  X,
  Clock,
  Globe,
  Monitor,
  CheckCircle2,
  Mail,
  Send,
  Trash2,
} from "lucide-react";

interface SubmissionDetailsDrawerProps {
  submission: FormSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (submissionId: string, status: SubmissionStatus) => void;
  onAddNote: (submissionId: string, note: string) => void;
  onDelete: (submissionId: string) => void;
}

export const SubmissionDetailsDrawer: React.FC<SubmissionDetailsDrawerProps> = ({
  submission,
  isOpen,
  onClose,
  onStatusChange,
  onAddNote,
  onDelete,
}) => {
  const [noteContent, setNoteContent] = useState("");

  if (!isOpen || !submission) return null;

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    onAddNote(submission.id, noteContent.trim());
    setNoteContent("");
  };

  const statusColors: Record<SubmissionStatus, string> = {
    new: "bg-status-info-soft text-status-info border-status-info/30",
    read: "bg-surface-subtle text-text-secondary border-border",
    replied: "bg-status-success-soft text-status-success border-status-success/30",
    archived: "bg-surface-subtle text-text-muted border-border",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                statusColors[submission.status]
              }`}
            >
              {submission.status}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                {submission.formName}
              </h3>
              <p className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{new Date(submission.submittedAt).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(submission.id)}
              className="p-2 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger-soft transition-colors"
              title="Delete submission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Actions Bar */}
        <div className="px-5 py-3 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-text-secondary">Mark Status:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStatusChange(submission.id, "new")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all ${
                submission.status === "new"
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border text-text-secondary hover:bg-surface-subtle"
              }`}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(submission.id, "read")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all ${
                submission.status === "read"
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border text-text-secondary hover:bg-surface-subtle"
              }`}
            >
              Read
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(submission.id, "replied")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all ${
                submission.status === "replied"
                  ? "bg-status-success text-white border-status-success"
                  : "border-border text-text-secondary hover:bg-surface-subtle"
              }`}
            >
              Replied
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(submission.id, "archived")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-all ${
                submission.status === "archived"
                  ? "bg-slate-700 text-white border-slate-700"
                  : "border-border text-text-secondary hover:bg-surface-subtle"
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Submission Fields Grid */}
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Submitted Information
            </h4>
            <div className="bg-surface-subtle border border-border rounded-xl p-4 divide-y divide-border/60">
              {Object.entries(submission.data || {}).map(([key, value]) => {
                const isEmail = String(value).includes("@");

                return (
                  <div key={key} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-text-muted capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <div className="text-sm font-semibold text-text-primary break-words">
                      {typeof value === "boolean" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-status-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{value ? "Yes" : "No"}</span>
                        </span>
                      ) : Array.isArray(value) ? (
                        value.join(", ")
                      ) : isEmail ? (
                        <a
                          href={`mailto:${value}`}
                          className="text-brand hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>{String(value)}</span>
                        </a>
                      ) : (
                        String(value || "—")
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Metadata */}
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Request Metadata
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-surface-subtle flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-text-muted uppercase">IP Address</span>
                  <span className="text-xs font-mono font-bold text-text-primary truncate block">
                    {submission.ipAddress || "Localhost / N/A"}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-subtle flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-text-muted uppercase">Client System</span>
                  <span className="text-xs font-bold text-text-primary truncate block" title={submission.userAgent}>
                    {submission.userAgent?.includes("Mac")
                      ? "macOS"
                      : submission.userAgent?.includes("Win")
                      ? "Windows"
                      : "Web Client"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes Section */}
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Internal Activity & Notes</span>
              <span className="text-[10px] lowercase font-normal">
                {submission.notes?.length || 0} notes
              </span>
            </h4>

            {/* Note Timeline */}
            <div className="space-y-3 mb-4">
              {submission.notes && submission.notes.length > 0 ? (
                submission.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border border-border bg-surface text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span className="font-bold text-text-primary">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed font-medium">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 border border-dashed border-border rounded-lg text-text-muted text-xs">
                  No internal notes yet. Add one below to track follow-ups.
                </div>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleSendNote} className="flex gap-2">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write an internal follow-up note..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                disabled={!noteContent.trim()}
                className="px-3.5 py-2 bg-brand text-brand-foreground rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
