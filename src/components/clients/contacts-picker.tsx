"use client";

import { useState } from "react";
import { Contact } from "lucide-react";

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

interface ContactsPickerProps {
  onSelect: (contact: ContactInfo) => void;
}

export function ContactsPicker({ onSelect }: ContactsPickerProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isPicking, setIsPicking] = useState(false);

  async function handlePick() {
    // Contact Picker API (Chrome on Android, some desktop browsers)
    if (!("contacts" in navigator && "ContactsManager" in window)) {
      setIsSupported(false);
      return;
    }

    setIsPicking(true);
    try {
      const props = ["name", "tel", "email"];
      const contacts = await (navigator as any).contacts.select(props, {
        multiple: false,
      });

      if (contacts && contacts.length > 0) {
        const c = contacts[0];
        onSelect({
          name: c.name?.[0] || "",
          phone: c.tel?.[0] || "",
          email: c.email?.[0] || "",
        });
      }
    } catch (err) {
      // User canceled or API error
      console.log("Contact picker cancelled or failed:", err);
    } finally {
      setIsPicking(false);
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handlePick}
      disabled={isPicking}
      className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
    >
      <Contact className="h-4 w-4" />
      {isPicking ? "Picking…" : "From contacts"}
    </button>
  );
}
