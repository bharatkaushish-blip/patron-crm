"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, FileSpreadsheet, FileDown, AlertCircle, Check } from "lucide-react";
import { importInventoryItems } from "@/lib/actions/inventory";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        current.push(cell);
        cell = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        current.push(cell);
        cell = "";
        rows.push(current);
        current = [];
        if (char === "\r") i++;
      } else {
        cell += char;
      }
    }
  }

  if (cell || current.length > 0) {
    current.push(cell);
    rows.push(current);
  }

  return rows;
}

const INVENTORY_FIELDS = [
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
  { value: "medium", label: "Medium" },
  { value: "dimensions", label: "Dimensions" },
  { value: "year", label: "Year" },
  { value: "asking_price", label: "Asking Price" },
  { value: "reserve_price", label: "Reserve Price" },
  { value: "status", label: "Status" },
  { value: "source", label: "Source" },
  { value: "consignor", label: "Consignor" },
  { value: "notes", label: "Notes" },
];

export function InventoryCsvImport() {
  const [isPending, startTransition] = useTransition();
  const [importState, setImportState] = useState<
    "idle" | "mapping" | "importing" | "done"
  >("idle");
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDownloadTemplate() {
    const template = [
      "Title,Artist,Medium,Dimensions,Year,Asking Price,Reserve Price,Status,Source,Consignor,Notes",
      'Untitled Landscape,M.F. Husain,Oil on canvas,36 x 48 in,1970,500000,350000,available,owned,,',
      'Bronze Horse,Unknown,Bronze sculpture,18 x 24 x 12 in,2020,150000,,available,consignment,Ram Gallery,',
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = parseCSV(text);
      if (lines.length < 2) return;

      setCsvHeaders(lines[0]);
      setCsvRows(lines.slice(1).filter((row) => row.some((cell) => cell.trim())));

      // Auto-map columns
      const autoMap: Record<string, string> = {};
      const fieldKeys = INVENTORY_FIELDS.map((f) => f.value);
      for (const header of lines[0]) {
        const lower = header.toLowerCase().trim().replace(/\s+/g, "_");
        for (const field of fieldKeys) {
          if (lower.includes(field) && !Object.values(autoMap).includes(field)) {
            autoMap[header] = field;
          }
        }
      }
      setColumnMap(autoMap);
      setImportState("mapping");
    };
    reader.readAsText(file);
  }

  function handleImport() {
    const mappedRows = csvRows.map((row) => {
      const obj: Record<string, string> = {};
      csvHeaders.forEach((header, i) => {
        const field = columnMap[header];
        if (field) {
          obj[field] = row[i] || "";
        }
      });
      return obj;
    });

    const validRows = mappedRows.filter((r) => r.title?.trim());

    setImportState("importing");
    startTransition(async () => {
      const result = await importInventoryItems(
        validRows as {
          title: string;
          artist?: string;
          medium?: string;
          dimensions?: string;
          year?: string;
          asking_price?: string;
          reserve_price?: string;
          status?: string;
          source?: string;
          consignor?: string;
          notes?: string;
        }[]
      );
      setImportResult(result);
      setImportState("done");
    });
  }

  function resetImport() {
    setImportState("idle");
    setCsvRows([]);
    setCsvHeaders([]);
    setColumnMap({});
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (importState === "idle") {
    return (
      <div className="flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Upload className="h-4 w-4" />
          Import CSV
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="rounded-lg p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          title="Download template CSV"
        >
          <FileDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (importState === "mapping") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">
              <FileSpreadsheet className="inline h-4 w-4 mr-1" />
              Map columns ({csvRows.length} rows)
            </p>
            <button
              onClick={resetImport}
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              Cancel
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {csvHeaders.map((header) => (
              <div key={header} className="flex items-center gap-3 text-sm">
                <span className="w-32 truncate text-neutral-600">{header}</span>
                <span className="text-neutral-300">&rarr;</span>
                <select
                  value={columnMap[header] || ""}
                  onChange={(e) =>
                    setColumnMap((prev) => ({
                      ...prev,
                      [header]: e.target.value,
                    }))
                  }
                  className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Skip</option>
                  {INVENTORY_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {!Object.values(columnMap).includes("title") ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Map at least the Title column to import
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={!Object.values(columnMap).includes("title") || isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Import {csvRows.length} items
            </button>
            <button
              onClick={resetImport}
              className="rounded-md px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (importState === "importing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 rounded-xl bg-white p-6 shadow-xl">
          <p className="text-sm text-neutral-500">Importing...</p>
        </div>
      </div>
    );
  }

  if (importState === "done" && importResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Imported {importResult.imported} item
            {importResult.imported !== 1 ? "s" : ""}
          </div>
          {importResult.errors.length > 0 ? (
            <div className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto">
              {importResult.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          ) : null}
          <button
            onClick={resetImport}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
