import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllCmsStartups } from "@/lib/cms/startups";
import ExcelJS from "exceljs";

const BRAND = { bg: "D6E8D0", text: "2D5016", accent: "3D5C22" };

const SECTION_COLORS: Record<string, { bg: string; text: string }> = {
  "Pre-Incubation": { bg: "DBEAFE", text: "1E40AF" },
  "Incubation":     { bg: "D6E8D0", text: "2D5016" },
  "Acceleration":   { bg: "EDE9FE", text: "6D28D9" },
};

const SCHEME_META: Record<string, { label: string; section: string }> = {
  "nidhi-prayas":           { label: "NIDHI Prayas",           section: "Pre-Incubation" },
  "nidhi-eir":              { label: "NIDHI EIR",              section: "Pre-Incubation" },
  "genesis-eir":            { label: "GENESIS EIR",            section: "Pre-Incubation" },
  "meity-i":                { label: "MeitY Phase I",           section: "Incubation" },
  "meity-ii":               { label: "MeitY Phase II",          section: "Incubation" },
  "sisf":                   { label: "SISF",                    section: "Incubation" },
  "idex":                   { label: "iDEX",                    section: "Incubation" },
  "bionest":                { label: "BioNEST",                 section: "Incubation" },
  "startup-bihar":          { label: "Startup Bihar",           section: "Incubation" },
  "msme":                   { label: "MSME",                    section: "Incubation" },
  "business-acceleration":  { label: "Business Acceleration",   section: "Acceleration" },
  "technical-acceleration": { label: "Technical Acceleration",  section: "Acceleration" },
};

const SECTION_ORDER = ["Pre-Incubation", "Incubation", "Acceleration"];

function applyBorder(row: ExcelJS.Row, colCount: number, style: ExcelJS.BorderStyle = "thin") {
  for (let c = 1; c <= colCount; c++) {
    row.getCell(c).border = {
      top:    { style, color: { argb: "FFD0D0D0" } },
      bottom: { style, color: { argb: "FFD0D0D0" } },
      left:   { style, color: { argb: "FFD0D0D0" } },
      right:  { style, color: { argb: "FFD0D0D0" } },
    };
  }
}

export async function GET() {
  await requireAuth();

  const all = await getAllCmsStartups();

  const wb = new ExcelJS.Workbook();
  wb.creator = "IC IITP Admin";

  // ── Sheet 1: All Startups (flat, importable) ─────────────────────────────
  const flat = wb.addWorksheet("All Startups", {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { tabColor: { argb: "FF" + BRAND.accent } },
  });

  flat.columns = [
    { width: 30 }, // Name
    { width: 24 }, // Scheme
    { width: 52 }, // Tagline
    { width: 28 }, // Sectors
    { width: 28 }, // Founders
    { width: 36 }, // Website
    { width: 10 }, // Published
  ];

  // Title row
  flat.mergeCells("A1:G1");
  const titleRow = flat.getRow(1);
  titleRow.getCell(1).value = `IC IITP Portfolio Export — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} — ${all.length} startups`;
  titleRow.getCell(1).font = { bold: true, size: 11, color: { argb: "FF" + BRAND.text } };
  titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + BRAND.bg } };
  titleRow.getCell(1).alignment = { vertical: "middle" };
  titleRow.height = 22;
  titleRow.border = {
    top:    { style: "medium", color: { argb: "FF" + BRAND.accent } },
    bottom: { style: "medium", color: { argb: "FF" + BRAND.accent } },
    left:   { style: "medium", color: { argb: "FF" + BRAND.accent } },
    right:  { style: "medium", color: { argb: "FF" + BRAND.accent } },
  };

  // Column headers
  const headers = ["Name", "Scheme", "Tagline", "Sectors", "Founders", "Website", "Published"];
  const headerRow = flat.getRow(2);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: "FF" + BRAND.text } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECF5E8" } };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 18;
  applyBorder(headerRow, 7);

  // Data rows
  all.forEach((s, idx) => {
    const r = flat.getRow(3 + idx);
    r.getCell(1).value = s.name;
    r.getCell(2).value = s.scheme;
    r.getCell(3).value = s.tagline ?? "";
    r.getCell(4).value = s.sectors.join(", ");
    r.getCell(5).value = s.founders.join(", ");
    r.getCell(6).value = s.website ?? "";
    r.getCell(7).value = s.published ? "Yes" : "No";
    r.getCell(7).font = { size: 10, color: { argb: s.published ? "FF166534" : "FF6B7280" } };
    for (let c = 1; c <= 6; c++) r.getCell(c).font = { size: 10 };
    applyBorder(r, 7);
  });

  // ── Sheet 2+: One sheet per section ──────────────────────────────────────
  for (const section of SECTION_ORDER) {
    const sectionSchemes = Object.entries(SCHEME_META)
      .filter(([, m]) => m.section === section)
      .map(([key]) => key);

    const sectionStartups = all.filter((s) => sectionSchemes.includes(s.scheme));
    const color = SECTION_COLORS[section] ?? BRAND;

    const ws = wb.addWorksheet(section, {
      views: [{ state: "frozen", ySplit: 3 }],
      properties: { tabColor: { argb: "FF" + color.text } },
    });

    ws.columns = [
      { width: 30 }, // Name
      { width: 22 }, // Scheme
      { width: 52 }, // Tagline
      { width: 28 }, // Sectors
      { width: 28 }, // Founders
      { width: 36 }, // Website
      { width: 10 }, // Published
    ];

    // Section title
    ws.mergeCells("A1:G1");
    const secTitle = ws.getRow(1);
    secTitle.getCell(1).value = `${section} — ${sectionStartups.length} startups`;
    secTitle.getCell(1).font = { bold: true, size: 12, color: { argb: "FF" + color.text } };
    secTitle.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + color.bg } };
    secTitle.getCell(1).alignment = { vertical: "middle" };
    secTitle.height = 22;
    secTitle.border = {
      top:    { style: "medium", color: { argb: "FF" + color.text } },
      bottom: { style: "medium", color: { argb: "FF" + color.text } },
      left:   { style: "medium", color: { argb: "FF" + color.text } },
      right:  { style: "medium", color: { argb: "FF" + color.text } },
    };

    // Column headers
    const wsHeaderRow = ws.getRow(2);
    headers.forEach((h, i) => {
      const cell = wsHeaderRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, size: 10, color: { argb: "FF" + color.text } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + color.bg + "80" } };
      cell.alignment = { vertical: "middle" };
    });
    wsHeaderRow.height = 18;
    applyBorder(wsHeaderRow, 7);

    if (sectionStartups.length === 0) {
      ws.mergeCells("A3:G3");
      const emptyRow = ws.getRow(3);
      emptyRow.getCell(1).value = "(no startups in this section)";
      emptyRow.getCell(1).font = { italic: true, color: { argb: "FF999999" } };
    } else {
      // Group by scheme within section
      let rowIdx = 3;
      for (const schemeKey of sectionSchemes) {
        const schemeStartups = sectionStartups.filter((s) => s.scheme === schemeKey);
        if (schemeStartups.length === 0) continue;

        // Scheme sub-header
        ws.mergeCells(`A${rowIdx}:G${rowIdx}`);
        const schemeRow = ws.getRow(rowIdx);
        schemeRow.getCell(1).value = SCHEME_META[schemeKey]?.label ?? schemeKey;
        schemeRow.getCell(1).font = { bold: true, size: 9, color: { argb: "FF" + color.text }, italic: true };
        schemeRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } };
        applyBorder(schemeRow, 7, "thin");
        rowIdx++;

        for (const s of schemeStartups) {
          const r = ws.getRow(rowIdx);
          r.getCell(1).value = s.name;
          r.getCell(2).value = s.scheme;
          r.getCell(3).value = s.tagline ?? "";
          r.getCell(4).value = s.sectors.join(", ");
          r.getCell(5).value = s.founders.join(", ");
          r.getCell(6).value = s.website ?? "";
          r.getCell(7).value = s.published ? "Yes" : "No";
          r.getCell(7).font = { size: 10, color: { argb: s.published ? "FF166534" : "FF6B7280" } };
          for (let c = 1; c <= 6; c++) r.getCell(c).font = { size: 10 };
          applyBorder(r, 7);
          rowIdx++;
        }
      }
    }
  }

  const buf = await (wb.xlsx.writeBuffer() as unknown as Promise<Buffer>);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="portfolio-export-${date}.xlsx"`,
    },
  });
}
