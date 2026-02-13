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
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add enquiry
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-700">New enquiry</h3>
        <button
          type="button"
          onClick={reset}
          className="p-1 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Step 1a: Search for a client */}
      {step === "select-client" && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client by name…"
              className="w-full rounded-md border border-neutral-300 pl-8 pr-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {searchQuery.length >= 1 && (
            <div className="rounded-md border border-neutral-200 bg-white max-h-48 overflow-y-auto">
              {isSearching ? (
                <p className="px-3 py-2 text-xs text-neutral-400">Searching…</p>
              ) : results.length > 0 ? (
                results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-medium text-neutral-800">{c.name}</span>
                    {c.location && (
                      <span className="text-xs text-neutral-400">{c.location}</span>
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-neutral-400">No clients found</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("create-client")}
            className="flex items-center gap-1.5 w-full rounded-md border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors justify-center"
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
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to search
          </button>

          <input
            name="name"
            type="text"
            required
            placeholder="Client name *"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="phone"
              type="text"
              placeholder="Phone (optional)"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={isPendingClient}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPendingClient ? "Creating…" : "Create & continue"}
          </button>
        </form>
      )}

      {/* Step 2: Enquiry form */}
      {step === "enquiry" && selectedClient && (
        <form onSubmit={handleSubmitEnquiry} className="space-y-3">
          <div className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2">
            <span className="text-sm text-neutral-600">
              Client: <span className="font-medium text-neutral-800">{selectedClient.name}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedClient(null);
                setStep("select-client");
              }}
              className="ml-auto text-xs text-neutral-500 hover:text-neutral-700 underline"
            >
              Change
            </button>
          </div>

          {inventoryItems.length > 0 && (
            <div>
              <select
                value={selectedItemId}
                onChange={handleInventorySelect}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <input
              name="budget"
              type="text"
              placeholder="Budget (e.g. ₹2-5L)"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="artist"
              type="text"
              placeholder="Artist preference"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <div>
              <input
                name="timeline"
                type="date"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <p className="mt-0.5 text-[10px] text-neutral-400">Timeline / deadline</p>
            </div>
          </div>

          <input
            name="work_type"
            type="text"
            placeholder="Type of work (e.g. oil painting, sculpture)"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <textarea
            name="notes"
            placeholder="Notes (optional)"
            rows={2}
            className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPendingEnquiry}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPendingEnquiry ? "Saving…" : "Save enquiry"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
