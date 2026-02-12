"use client";

import { useState } from "react";

const COUNTRY_CODES = [
  { code: "+91", label: "IN +91", country: "India" },
  { code: "+1", label: "US +1", country: "United States" },
  { code: "+44", label: "UK +44", country: "United Kingdom" },
  { code: "+971", label: "AE +971", country: "UAE" },
  { code: "+65", label: "SG +65", country: "Singapore" },
  { code: "+49", label: "DE +49", country: "Germany" },
  { code: "+33", label: "FR +33", country: "France" },
  { code: "+61", label: "AU +61", country: "Australia" },
  { code: "+81", label: "JP +81", country: "Japan" },
  { code: "+86", label: "CN +86", country: "China" },
  { code: "+7", label: "RU +7", country: "Russia" },
  { code: "+39", label: "IT +39", country: "Italy" },
  { code: "+34", label: "ES +34", country: "Spain" },
  { code: "+55", label: "BR +55", country: "Brazil" },
  { code: "+27", label: "ZA +27", country: "South Africa" },
  { code: "+82", label: "KR +82", country: "South Korea" },
  { code: "+966", label: "SA +966", country: "Saudi Arabia" },
  { code: "+974", label: "QA +974", country: "Qatar" },
];

interface PhoneInputProps {
  name: string;
  label?: string;
  defaultValue?: string;
}

export function PhoneInput({ name, label, defaultValue }: PhoneInputProps) {
  // Parse existing value to extract prefix
  const parsed = parsePhone(defaultValue || "");
  const [prefix, setPrefix] = useState(parsed.prefix);
  const [number, setNumber] = useState(parsed.number);

  // The hidden input sends the combined value
  const fullValue = number ? `${prefix} ${number}` : "";

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      ) : null}
      <input type="hidden" name={name} value={fullValue} />
      <div className="flex gap-2">
        <select
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className="w-24 shrink-0 rounded-lg border border-neutral-300 bg-white px-2 py-2.5 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Phone number"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        />
      </div>
    </div>
  );
}

function parsePhone(value: string): { prefix: string; number: string } {
  if (!value) return { prefix: "+91", number: "" };

  // Try to match known prefixes
  for (const c of COUNTRY_CODES) {
    if (value.startsWith(c.code + " ") || value.startsWith(c.code)) {
      const num = value.slice(c.code.length).trim();
      return { prefix: c.code, number: num };
    }
  }

  // If starts with + but not matched, try to extract
  if (value.startsWith("+")) {
    const spaceIdx = value.indexOf(" ");
    if (spaceIdx > 0) {
      return { prefix: value.slice(0, spaceIdx), number: value.slice(spaceIdx + 1) };
    }
  }

  return { prefix: "+91", number: value };
}
