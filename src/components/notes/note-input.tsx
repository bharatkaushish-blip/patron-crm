"use client";

import { useState, useRef, useTransition } from "react";
import { Send, CalendarPlus, X } from "lucide-react";
import { createNote } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";

interface NoteInputProps {
  clientId: string;
}

export function NoteInput({ clientId }: NoteInputProps) {
  const [content, setContent] = useState("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    if (!content.trim() || isPending) return;

    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("content", content.trim());
    if (followUpDate) {
      formData.set("follow_up_date", followUpDate);
    }

    startTransition(async () => {
      await createNote(formData);
    });

    // Clear immediately for snappy feel
    setContent("");
    setFollowUpDate("");
    setShowDatePicker(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 120) + "px";
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          placeholder="Add a note..."
          rows={1}
          className="flex-1 resize-none border-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
            content.trim()
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-neutral-100 text-neutral-300"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {!showDatePicker && !followUpDate ? (
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-xs text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 transition-colors"
          >
            <CalendarPlus className="h-3 w-3" />
            Follow-up
          </button>
        ) : null}

        {showDatePicker && !followUpDate ? (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              min={today}
              onChange={(e) => {
                setFollowUpDate(e.target.value);
                setShowDatePicker(false);
              }}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="rounded-md p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}

        {followUpDate ? (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
              <CalendarPlus className="h-3 w-3" />
              Follow-up:{" "}
              {new Date(followUpDate + "T00:00:00").toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => {
                setFollowUpDate("");
                setShowDatePicker(false);
              }}
              className="rounded-md p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
