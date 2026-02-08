"use client";

import { useState, useTransition, useRef } from "react";
import { Download, Upload, FileSpreadsheet, FileDown, AlertCircle, Check } from "lucide-react";
import { exportData, importClients } from "@/lib/actions/settings";

export function DataSection() {
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
      "Name,Phone,Email,Location,Country,Age Range,Tags",
      "Priya Sharma,+91 9876543210,priya@example.com,Mumbai,India,30-40,\"abstract, contemporary\"",
      "John Smith,+1 5551234567,john@example.com,New York,United States,40-50,\"figurative, oil painting\"",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patron-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExport() {
    startTransition(async () => {
      const data = await exportData();

      // Build clients CSV
      const clientHeaders = [
        "Name",
        "Phone",
        "Email",
        "Location",
        "Country",
        "Age Range",
        "Tags",
      ];
      const clientRows = data.clients.map((c: any) => [
        c.name,
        c.phone || "",
        c.email || "",
        c.location || "",
        c.country || "",
        c.age_range || "",
        (c.tags || []).join(", "),
      ]);

      const noteHeaders = [
        "Client",
        "Content",
        "Follow-up Date",
        "Follow-up Status",
        "Created",
      ];
      const noteRows = data.notes.map((n: any) => [
        (n.clients as any)?.name || "",
        n.content,
        n.follow_up_date || "",
        n.follow_up_status || "",
        n.created_at,
      ]);

      const saleHeaders = [
        "Client",
        "Artwork",
        "Amount",
        "Date",
        "Notes",
      ];
      const saleRows = data.sales.map((s: any) => [
        (s.clients as any)?.name || "",
        s.artwork_name || "",
        s.amount || "",
        s.sale_date || "",
        s.notes || "",
      ]);

      const csvContent = [
        "--- CLIENTS ---",
        clientHeaders.join(","),
        ...clientRows.map((r: string[]) => r.map(escapeCSV).join(",")),
        "",
        "--- NOTES ---",
        noteHeaders.join(","),
        ...noteRows.map((r: string[]) => r.map(escapeCSV).join(",")),
        "",
        "--- SALES ---",
        saleHeaders.join(","),
        ...saleRows.map((r: string[]) => r.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patron-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
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
      const fields = ["name", "phone", "email", "location", "country", "tags"];
      for (const header of lines[0]) {
        const lower = header.toLowerCase().trim();
        for (const field of fields) {
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

    // Filter rows that have at least a name
    const validRows = mappedRows.filter((r) => r.name?.trim());

    setImportState("importing");
    startTransition(async () => {
      const result = await importClients(
        validRows as { name: string; phone?: string; email?: string; location?: string; country?: string; tags?: string }[]
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

  return (
    <section>
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Data
      </h2>
      <div className="space-y-3">
        {/* Export */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700">Export data</p>
              <p className="text-xs text-neutral-400">
                Download all clients, notes, and sales as CSV
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          {importState === "idle" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    Import clients
                  </p>
                  <p className="text-xs text-neutral-400">
                    Upload a CSV file with client data
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download template CSV
              </button>
            </div>
          ) : importState === "mapping" ? (
            <div className="space-y-4">
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

              <div className="space-y-2">
                {csvHeaders.map((header) => (
                  <div
                    key={header}
                    className="flex items-center gap-3 text-sm"
                  >
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
                      className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-neutral-500 focus:outline-none"
                    >
                      <option value="">Skip</option>
                      <option value="name">Name</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="location">Location</option>
                      <option value="country">Country</option>
                      <option value="tags">Tags (comma-separated)</option>
                    </select>
                  </div>
                ))}
              </div>

              {!Object.values(columnMap).includes("name") ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Map at least the Name column to import
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={!Object.values(columnMap).includes("name") || isPending}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  Import {csvRows.length} clients
                </button>
                <button
                  onClick={resetImport}
                  className="rounded-md px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : importState === "importing" ? (
            <p className="text-sm text-neutral-500">Importing…</p>
          ) : importState === "done" && importResult ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Imported {importResult.imported} client
                {importResult.imported !== 1 ? "s" : ""}
              </div>
              {importResult.errors.length > 0 ? (
                <div className="text-xs text-red-500 space-y-1">
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
          ) : null}
        </div>
      </div>
    </section>
  );
}

function escapeCSV(value: string | number | null): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
