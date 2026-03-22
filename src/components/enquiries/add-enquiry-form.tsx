"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Plus, X, Search, UserPlus, ChevronLeft } from "lucide-react";
import { searchClients, createClientAndReturnId } from "@/lib/actions/clients";
import { createEnquiry } from "@/lib/actions/enquiries";

type ClientResult = { id: string; name: string; phone: string | null; location: string | null };

interface InventoryItem {
  id: string;
  title: string;
  artist: string | null;
  dimensions: string | null;
}

export function AddEnquiryForm({
  inventoryItems = [],
}: {
  inventoryItems?: InventoryItem[];
}) {
  const [step, setStep] = useState<"closed" | "select-client" | "create-client" | "enquiry">("closed");
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);

  // Client search state
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ClientResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // New client form state
  const [isPendingClient, startClientTransition] = useTransition();

  // Enquiry form state
  const [isPendingEnquiry, startEnquiryTransition] = useTransition();
  const [selectedItemId, setSelectedItemId] = useState("");
  const [artist, setArtist] = useState("");
  const [size, setSize] = useState("");

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const data = await searchClients(q);
    setResults(data);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (step === "select-client") {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
      return () => clearTimeout(debounceRef.current);
    }
  }, [searchQuery, step, doSearch]);

  useEffect(() => {
    if (step === "select-client" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [step]);

  function reset() {
    setStep("closed");
    setSelectedClient(null);
    setSearchQuery("");
    setResults([]);
    setSelectedItemId("");
    setArtist("");
    setSize("");
  }

  function selectClient(client: { id: string; name: string }) {
    setSelectedClient(client);
    setStep("enquiry");
  }

  function handleInventorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = e.target.value;
    setSelectedItemId(itemId);
    if (itemId) {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (item) {
        if (item.artist) setArtist(item.artist);
        if (item.dimensions) setSize(item.dimensions);
      }
    }
  }

  function handleCreateClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startClientTransition(async () => {
      const result = await createClientAndReturnId(formData);
      if ("error" in result) return;
      selectClient({ id: result.id!, name: result.name! });
    });
  }

  function handleSubmitEnquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("client_id", selectedClient!.id);
    if (selectedItemId) {
      formData.set("inventory_item_id", selectedItemId);
    }
    startEnquiryTransition(async () => {
      await createEnquiry(formData);
      reset();
    });
  }

  if (step === "closed") {
    return (
      <button
        onClick={() => setStep("select-client")}
        className="flex items-center gap-1.5 border border-dashed border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-[#5f5f5f] hover:border-[#9e9c9c] hover:text-neutral-600 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add enquiry
      </button>
    );
  }

  return (
    <div className="border border-[#b2b2b1]/15 bg-[#ffffff] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium font-serif text-neutral-700">New enquiry</h3>
        <button
          type="button"
          onClick={reset}
          className="p-1 text-[#9e9c9c] hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step 1a: Search for a client */}
      {step === "select-client" && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#9e9c9c]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client by name…"
              className="w-full border border-[#b2b2b1]/20 pl-8 pr-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
          </div>

          {searchQuery.length >= 1 && (
            <div className="border border-[#b2b2b1]/15 bg-[#ffffff] max-h-48 overflow-y-auto">
              {isSearching ? (
                <p className="px-3 py-2 text-xs font-body text-[#9e9c9c]">Searching…</p>
              ) : results.length > 0 ? (
                results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-body hover:bg-[#f6f3f2] transition-colors"
                  >
                    <span className="font-medium text-neutral-800">{c.name}</span>
                    {c.location && (
                      <span className="text-xs text-[#9e9c9c]">{c.location}</span>
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs font-body text-[#9e9c9c]">No clients found</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("create-client")}
            className="flex items-center gap-1.5 w-full border border-dashed border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-[#5f5f5f] hover:border-[#9e9c9c] hover:text-neutral-600 transition-colors justify-center"
          >
            <UserPlus className="h-4 w-4" />
            Create new client
          </button>
        </div>
      )}

      {/* Step 1b: Create new client inline */}
      {step === "create-client" && (
        <form onSubmit={handleCreateClient} className="space-y-3">
          <button
            type="button"
            onClick={() => setStep("select-client")}
            className="flex items-center gap-1 text-xs font-body text-[#5f5f5f] hover:text-neutral-700"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to search
          </button>

          <input
            name="name"
            type="text"
            required
            placeholder="Client name *"
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="phone"
              type="text"
              placeholder="Phone (optional)"
              className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
          </div>

          <button
            type="submit"
            disabled={isPendingClient}
            className="bg-[#735a3a] px-4 py-2 text-sm font-medium font-body text-white hover:bg-[#664e30] disabled:opacity-50"
          >
            {isPendingClient ? "Creating…" : "Create & continue"}
          </button>
        </form>
      )}

      {/* Step 2: Enquiry form */}
      {step === "enquiry" && selectedClient && (
        <form onSubmit={handleSubmitEnquiry} className="space-y-3">
          <div className="flex items-center gap-2 bg-[#f6f3f2] px-3 py-2">
            <span className="text-sm font-body text-neutral-600">
              Client: <span className="font-medium text-neutral-800">{selectedClient.name}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedClient(null);
                setStep("select-client");
              }}
              className="ml-auto text-xs font-body text-[#5f5f5f] hover:text-neutral-700 underline"
            >
              Change
            </button>
          </div>

          {inventoryItems.length > 0 && (
            <div>
              <select
                value={selectedItemId}
                onChange={handleInventorySelect}
                className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-neutral-700 focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
              >
                <option value="">Suggest artwork (optional)</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                    {item.artist ? ` — ${item.artist}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              name="size"
              type="text"
              placeholder="Size (e.g. 4x6 ft)"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
            <input
              name="budget"
              type="text"
              placeholder="Budget (e.g. ₹2-5L)"
              className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="artist"
              type="text"
              placeholder="Artist preference"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            />
            <div>
              <input
                name="timeline"
                type="date"
                className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-neutral-700 focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
              />
              <p className="mt-0.5 text-[10px] font-body text-[#9e9c9c]">Timeline / deadline</p>
            </div>
          </div>

          <input
            name="work_type"
            type="text"
            placeholder="Type of work (e.g. oil painting, sculpture)"
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
          />

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            rows={2}
            className="w-full resize-none border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPendingEnquiry}
              className="bg-[#735a3a] px-4 py-2 text-sm font-medium font-body text-white hover:bg-[#664e30] disabled:opacity-50"
            >
              {isPendingEnquiry ? "Saving…" : "Save enquiry"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm font-body text-[#5f5f5f] hover:bg-[#f0eded]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
