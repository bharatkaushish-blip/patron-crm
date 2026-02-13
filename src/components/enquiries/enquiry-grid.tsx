"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { EnquiryGroupCard } from "./enquiry-card";
import type { EnquiryItem } from "./enquiry-card";

interface InventoryItem {
  id: string;
  title: string;
  artist: string | null;
  dimensions: string | null;
}

interface EnquiryData {
  id: string;
  client_id: string;
  clientName?: string;
  size: string | null;
  budget: string | null;
  artist: string | null;
  timeline: string | null;
  work_type: string | null;
  notes: string | null;
  created_at: string;
  inventory_item_id: string | null;
  inventory_title: string | null;
}

interface ClientGroup {
  clientId: string;
  clientName: string;
  enquiries: EnquiryItem[];
  latestCreatedAt: string;
}

interface EnquiryGridProps {
  enquiries: EnquiryData[];
  canEdit: boolean;
  canDelete: boolean;
  inventoryItems?: InventoryItem[];
}

const STORAGE_KEY = "enquiry-group-order";

function getStoredOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // localStorage unavailable
  }
}

function groupByClient(enquiries: EnquiryData[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>();

  for (const enq of enquiries) {
    const existing = map.get(enq.client_id);
    const item: EnquiryItem = {
      id: enq.id,
      clientId: enq.client_id,
      size: enq.size,
      budget: enq.budget,
      artist: enq.artist,
      timeline: enq.timeline,
      workType: enq.work_type,
      notes: enq.notes,
      createdAt: enq.created_at,
      inventoryItemId: enq.inventory_item_id,
      inventoryTitle: enq.inventory_title,
    };

    if (existing) {
      existing.enquiries.push(item);
      if (enq.created_at > existing.latestCreatedAt) {
        existing.latestCreatedAt = enq.created_at;
      }
    } else {
      map.set(enq.client_id, {
        clientId: enq.client_id,
        clientName: enq.clientName || "Unknown",
        enquiries: [item],
        latestCreatedAt: enq.created_at,
      });
    }
  }

  // Sort enquiries within each group by created_at descending
  for (const group of map.values()) {
    group.enquiries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return Array.from(map.values());
}

function sortGroupsByStoredOrder(groups: ClientGroup[]): ClientGroup[] {
  const stored = getStoredOrder();
  if (stored.length === 0) return groups;

  const orderMap = new Map(stored.map((id, idx) => [id, idx]));
  return [...groups].sort((a, b) => {
    const aIdx = orderMap.get(a.clientId);
    const bIdx = orderMap.get(b.clientId);
    if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
    if (aIdx !== undefined) return -1;
    if (bIdx !== undefined) return 1;
    return 0;
  });
}

export function EnquiryGrid({ enquiries, canEdit, canDelete, inventoryItems = [] }: EnquiryGridProps) {
  const grouped = useMemo(() => groupByClient(enquiries), [enquiries]);
  const [items, setItems] = useState(() => sortGroupsByStoredOrder(grouped));
  const dragIdxRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    setItems(sortGroupsByStoredOrder(groupByClient(enquiries)));
  }, [enquiries]);

  const handleDragStart = useCallback((idx: number) => (e: React.DragEvent) => {
    dragIdxRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  }, []);

  const handleDragOver = useCallback((idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }, []);

  const handleDrop = useCallback((dropIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIdx(null);
    const fromIdx = dragIdxRef.current;
    if (fromIdx === null || fromIdx === dropIdx) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(dropIdx, 0, moved);
      setStoredOrder(next.map((g) => g.clientId));
      return next;
    });
    dragIdxRef.current = null;
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIdxRef.current = null;
    setDragOverIdx(null);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((group, idx) => (
        <div
          key={group.clientId}
          className={`transition-transform ${dragOverIdx === idx ? "scale-[1.02] ring-2 ring-neutral-300 rounded-xl" : ""}`}
        >
          <EnquiryGroupCard
            clientId={group.clientId}
            clientName={group.clientName}
            enquiries={group.enquiries}
            canEdit={canEdit}
            canDelete={canDelete}
            inventoryItems={inventoryItems}
            draggable
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver(idx)}
            onDrop={handleDrop(idx)}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}
