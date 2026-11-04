"use client";

import React from "react";
import { CMSPageItem } from "@/types/cms";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeletePageModalProps {
  page: CMSPageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePageModal: React.FC<DeletePageModalProps> = ({
  page,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-surface rounded-card border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-status-danger-soft text-status-danger flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">
              Delete Page &quot;{page.title}&quot;?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this page (<code className="font-mono text-text-primary bg-surface-subtle px-1.5 py-0.5 rounded border border-border">{page.slug}</code>)?
              This action cannot be undone and will automatically remove the page from website navigation.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn bg-status-danger text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
