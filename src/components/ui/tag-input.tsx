"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FuzzyResult {
  text: string;
  score: number;
  matches: number[]; // indices of matched characters
}

function fuzzyMatch(input: string, target: string): FuzzyResult | null {
  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();
  const matches: number[] = [];
  let score = 0;
  let targetIdx = 0;

  for (let i = 0; i < inputLower.length; i++) {
    const ch = inputLower[i];
    const found = targetLower.indexOf(ch, targetIdx);
    if (found === -1) return null;

    matches.push(found);

    // Bonus for consecutive matches
    if (found === targetIdx) {
      score += 2;
    } else {
      score += 1;
    }

    // Bonus for matching at start of word (after space/hyphen or at index 0)
    if (found === 0 || targetLower[found - 1] === " " || targetLower[found - 1] === "-") {
      score += 3;
    }

    targetIdx = found + 1;
  }

  // Prefer shorter targets (closer match to input length)
  score -= (target.length - input.length) * 0.1;

  return { text: target, score, matches };
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add tag...",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered: FuzzyResult[] = input
    ? suggestions
        .filter((s) => !value.includes(s))
        .map((s) => fuzzyMatch(input, s))
        .filter((r): r is FuzzyResult => r !== null)
        .sort((a, b) => b.score - a.score)
    : [];

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        Tags / Interests
      </label>
      <div className="relative">
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-400 focus-within:ring-offset-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow clicking suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[80px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        {showSuggestions && input && filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
            {filtered.slice(0, 8).map(({ text, matches }) => (
              <button
                key={text}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(text)}
                className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
              >
                {text.split("").map((ch, i) =>
                  matches.includes(i) ? (
                    <span key={i} className="font-semibold text-neutral-900">
                      {ch}
                    </span>
                  ) : (
                    <span key={i}>{ch}</span>
                  )
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="text-xs text-neutral-400">
        Press Enter or comma to add a tag
      </p>
    </div>
  );
}
