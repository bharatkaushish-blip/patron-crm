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
    <div className="border border-[#b2b2b1]/15 bg-[#ffffff] p-3 shadow-sm">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={autoResize}
          placeholder="Add a note..."
          rows={1}
          className="flex-1 resize-none border-none bg-transparent text-sm font-body text-[#323233] placeholder:text-[#9e9c9c] focus:outline-none"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center transition-colors",
            content.trim()
              ? "bg-[#735a3a] text-white hover:bg-[#664e30]"
              : "bg-[#f0eded] text-[#b2b2b1]/20"
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
            className="flex items-center gap-1 border border-dashed border-[#b2b2b1]/20 px-2.5 py-1 text-xs font-body text-[#9e9c9c] hover:border-[#9e9c9c] hover:text-[#5f5f5f] transition-colors"
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
              className="border border-[#b2b2b1]/20 px-2 py-1 text-xs font-body focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="p-1 text-[#9e9c9c] hover:text-neutral-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}

        {followUpDate ? (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 text-xs font-medium font-body text-amber-600">
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
              className="p-1 text-[#9e9c9c] hover:text-neutral-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
