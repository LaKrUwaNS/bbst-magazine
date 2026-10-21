"use client";

import React from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

interface EventDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventTitle: string;
  deleting: boolean;
}

export function EventDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  deleting,
}: EventDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-5 text-center">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close"
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 id="delete-dialog-title" className="text-base font-bold text-gray-900">
            Delete Event Publication?
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 font-semibold">&ldquo;{eventTitle}&rdquo;</strong>?
            This action cannot be undone and will permanently remove the event from both the public schedule and the dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
