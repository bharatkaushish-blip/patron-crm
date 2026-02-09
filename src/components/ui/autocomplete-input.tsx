"use client";

import { useState, useRef } from "react";

interface FuzzyResult {
  text: string;
  score: number;
  matches: number[];
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

    if (found === targetIdx) {
      score += 2;
    } else {
      score += 1;
    }

    if (found === 0 || targetLower[found - 1] === " " || targetLower[found - 1] === "-") {
      score += 3;
    }

    targetIdx = found + 1;
  }

  score -= (target.length - input.length) * 0.1;

  return { text: target, score, matches };
}

interface AutocompleteInputProps {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  suggestions: string[];
}

export function AutocompleteInput({
  name,
  label,
  placeholder,
  defaultValue = "",
  suggestions,
}: AutocompleteInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered: FuzzyResult[] = value
    ? suggestions
        .map((s) => fuzzyMatch(value, s))
        .filter((r): r is FuzzyResult => r !== null)
        .sort((a, b) => b.score - a.score)
    : [];

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1"
        />

        {showSuggestions && value && filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
            {filtered.slice(0, 8).map(({ text, matches }) => (
              <button
                key={text}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(text);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
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
    </div>
  );
}
