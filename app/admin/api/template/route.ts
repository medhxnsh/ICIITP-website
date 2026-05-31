import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api-client";
import type { CmsProgramDoc } from "@/lib/cms/programs";
import ExcelJS from "exceljs";

// Section colours — applied to the sheet header/tab based on the program's section
const SECTION_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  PRE_INCUBATION: { bg: "DBEAFE", text: "1E40AF", label: "Pre-Incubation" },
  INCUBATION:     { bg: "D6E8D0", text: "2D5016", label: "Incubation"     },
  ACCELERATION:   { bg: "CCFBF1", text: "0F766E", label: "Acceleration"   },
  OTHER:          { bg: "F1F5F9", text: "475569", label: "Other"           },
};

const COLS = [
  { header: "Name",     width: 30 },
  { header: "Scheme",   width: 26 },
  { header: "Tagline",  width: 52 },
  { header: "Sectors",  width: 28 },
  { header: "Founders", width: 28 },
  { header: "Website",  width: 36 },
];

const EMPTY_ROWS = 20;

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

// Sheet names in Excel are max 31 chars and cannot contain: \ / * ? [ ] :
function safeSheetName(name: string): string {
  return name.replace(/[\\/*?[\]:]/g, "-").substring(0, 31);
}

export async function GET() {
  await requireAuth();

  // Public endpoint — no auth required, always fresh, returns published programs
  const programs = await apiFetch<CmsProgramDoc[]>("/programs?size=200", {
    skipAuth: true,
    cache: "no-store",
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = "IC IITP Admin";

  for (const program of programs) {
    const styleKey = program.section ?? "OTHER";
    const style = SECTION_STYLE[styleKey] ?? SECTION_STYLE.OTHER;
    const sectionLabel = style.label;

    const ws = wb.addWorksheet(safeSheetName(program.title), {
      views: [{ state: "frozen", ySplit: 3 }],
      properties: { tabColor: { argb: "FF" + style.text } },
    });

    ws.columns = COLS.map((c) => ({ width: c.width }));

    // ── Row 1: programme title ────────────────────────────────────────────────
    ws.mergeCells("A1:F1");
    const titleRow = ws.getRow(1);
    titleRow.getCell(1).value = `${program.title}  ·  ${sectionLabel}`;
    titleRow.getCell(1).font  = { bold: true, size: 12, color: { argb: "FF" + style.text } };
    titleRow.getCell(1).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + style.bg } };
    titleRow.getCell(1).alignment = { vertical: "middle" };
    titleRow.height = 24;
    titleRow.border = {
      top:    { style: "medium", color: { argb: "FF" + style.text } },
      bottom: { style: "medium", color: { argb: "FF" + style.text } },
      left:   { style: "medium", color: { argb: "FF" + style.text } },
      right:  { style: "medium", color: { argb: "FF" + style.text } },
    };

    // ── Row 2: instructions ───────────────────────────────────────────────────
    ws.mergeCells("A2:F2");
    const noteRow = ws.getRow(2);
    noteRow.getCell(1).value = "Fill in the rows below. Sectors and Founders are comma-separated. Delete the example row before uploading.";
    noteRow.getCell(1).font  = { size: 9, italic: true, color: { argb: "FFB45309" } };
    noteRow.getCell(1).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
    noteRow.getCell(1).alignment = { vertical: "middle" };
    noteRow.height = 16;

    // ── Row 3: column headers ─────────────────────────────────────────────────
    const headerRow = ws.getRow(3);
    COLS.forEach((c, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = c.header;
      cell.font  = { bold: true, size: 10, color: { argb: "FF" + style.text } };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + style.bg } };
      cell.alignment = { vertical: "middle" };
    });
    headerRow.height = 18;
    applyBorder(headerRow, 6, "medium");

    // ── Row 4: example row (italic grey) ─────────────────────────────────────
    const exRow = ws.getRow(4);
    const exValues = ["Example Startup Name", program.slug, "One-line description of what the startup does.", "ESDM, IoT", "Founder Name", "https://example.com"];
    exValues.forEach((val, i) => {
      exRow.getCell(i + 1).value = val;
      exRow.getCell(i + 1).font  = { size: 10, italic: true, color: { argb: "FF9CA3AF" } };
      exRow.getCell(i + 1).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
    });
    exRow.height = 16;
    applyBorder(exRow, 6);

    // ── Rows 5+: empty rows with Scheme pre-filled ────────────────────────────
    for (let i = 0; i < EMPTY_ROWS; i++) {
      const r = ws.getRow(5 + i);
      r.getCell(2).value = program.slug;
      r.getCell(2).font  = { size: 10, italic: true, color: { argb: "FFADB5BD" } };
      r.getCell(2).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAFAFA" } };
      for (let c = 1; c <= 6; c++) {
        if (c !== 2) {
          r.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
        }
      }
      r.height = 16;
      applyBorder(r, 6);
    }
  }

  const buf = await (wb.xlsx.writeBuffer() as unknown as Promise<Buffer>);
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="startup-import-template.xlsx"`,
    },
  });
}
