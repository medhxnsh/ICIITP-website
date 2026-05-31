"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet } from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
import type { CmsStartup, StartupScheme } from "@/lib/cms/startups";

interface Props {
  onImport: (rows: Partial<CmsStartup>[]) => Promise<{ created: number; skipped: number }>;
}

export function StartupBulkImport({ onImport }: Props) {
  const [importRows, setImportRows] = useState<Partial<CmsStartup>[] | null>(null);
  const [importFilename, setImportFilename] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExcelFile(file: File) {
    setImportResult(null);
    setError(null);
    if (file.size > MAX_FILE_BYTES) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }
    setImportFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });

        const allRows: Partial<CmsStartup>[] = [];

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          if (!ws) continue;

          // Skip rows 1–2 (title + instructions), row 3 = headers
          // Detect by checking if A1 looks like a heading (not a column name).
          const a1 = String(ws["A1"]?.v ?? "");
          const a3 = String(ws["A3"]?.v ?? "");
          const hasTemplateLayout =
            a1.length > 20 || // merged title cell
            ["name", "startup"].every((k) => !a1.toLowerCase().startsWith(k));

          // If template layout: skip 2 title/note rows, then 1 header row = range 3
          // If plain header: row 1 = header = range 0
          const range = hasTemplateLayout && a3.toLowerCase() === "name" ? 3 : 0;

          const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "", range });

          const rows: Partial<CmsStartup>[] = raw
            .map((r) => ({
              name: r["Name"] ?? r["name"] ?? "",
              scheme: (r["Scheme"] ?? r["scheme"] ?? "").toLowerCase().replace(/\s+/g, "-") as StartupScheme,
              tagline: r["Tagline"] ?? r["tagline"] ?? "",
              sectors: (r["Sectors"] ?? r["sectors"] ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
              founders: (r["Founders"] ?? r["founders"] ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
              website: r["Website"] ?? r["website"] ?? "",
              published: true,
              sortOrder: 0,
            }))
            .filter((r) => r.name && r.scheme);

          allRows.push(...rows);
        }

        if (allRows.length === 0) {
          setError("No valid rows found. Make sure Name and Scheme columns are filled and example rows are deleted.");
          return;
        }
        setImportRows(allRows);
      } catch {
        setError("Failed to parse Excel file. Use the template format.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    if (!importRows) return;
    setImporting(true);
    setError(null);
    try {
      const result = await onImport(importRows);
      setImportResult(result);
      setImportRows(null);
      setImportFilename(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#92400e" }}>Bulk Import via Excel</h2>
        <a
          href="/admin/api/template"
          download
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Download Template
        </a>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>
      )}

      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50 transition-colors"
        style={{ borderColor: "#fcd34d" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleExcelFile(f); }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-5 h-5 mx-auto mb-2" style={{ color: "#d97706" }} />
        <p className="text-sm font-semibold" style={{ color: "#92400e" }}>
          {importFilename ?? "Drop .xlsx file here or click to browse"}
        </p>
        <p className="text-xs mt-1" style={{ color: "#b45309" }}>Fill in any scheme tab(s) from the template, then upload</p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExcelFile(f); }}
        />
      </div>

      {importRows && importRows.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold" style={{ color: "#92400e" }}>
            {importRows.length} rows parsed — preview (first 5):
          </p>
          <div className="overflow-x-auto rounded-xl border text-xs" style={{ borderColor: "#fde68a" }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#fef3c7" }}>
                  {["Name", "Scheme", "Tagline", "Sectors"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: "#92400e" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importRows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "#fef3c7" }}>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.scheme}</td>
                    <td className="px-3 py-2 max-w-[200px] truncate">{r.tagline}</td>
                    <td className="px-3 py-2">{r.sectors?.join(", ")}</td>
                  </tr>
                ))}
                {importRows.length > 5 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-center" style={{ color: "#b45309" }}>
                      +{importRows.length - 5} more rows…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#d97706" }}
          >
            <Upload className="w-4 h-4" />
            {importing ? "Importing…" : `Import ${importRows.length} rows`}
          </button>
        </div>
      )}

      {importResult && (
        <p className="text-sm font-semibold" style={{ color: "#065f46" }}>
          Import complete: {importResult.created} created, {importResult.skipped} skipped (duplicates).
        </p>
      )}
    </section>
  );
}
