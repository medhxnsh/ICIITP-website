import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSubmissions, type SubmissionType, type Submission } from "@/lib/submissions";
import ExcelJS from "exceljs";

const SUBMISSION_TYPES: SubmissionType[] = [
  "incubation", "lab-access", "internship", "feedback", "careers", "contact",
];

// Dashboard badge colors (bg / text) — match TYPE_COLORS in applications/page.tsx
const TYPE_THEME: Record<SubmissionType, { bg: string; text: string }> = {
  incubation:  { bg: "DDE8F5", text: "3D5A80" },
  "lab-access":{ bg: "DDF0E8", text: "2D6B50" },
  internship:  { bg: "EDE4F0", text: "6B4F7C" },
  feedback:    { bg: "F2E8E2", text: "7A4F3A" },
  careers:     { bg: "F2E8E2", text: "7A4F3A" },
  contact:     { bg: "DDEEE9", text: "2E6358" },
};

const SECTION_LABELS: Record<SubmissionType, string> = {
  incubation:  "INCUBATION",
  "lab-access":"LAB ACCESS",
  internship:  "INTERNSHIP",
  feedback:    "FEEDBACK",
  careers:     "CAREERS",
  contact:     "CONTACT",
};

type ColDef = { header: string; key: string; width: number };

const COLS: Record<SubmissionType, ColDef[]> = {
  incubation: [
    { header: "ID",               key: "id",              width: 38 },
    { header: "Scheme",           key: "scheme",          width: 16 },
    { header: "Startup Name",     key: "startupName",     width: 22 },
    { header: "Founder Name",     key: "founderName",     width: 20 },
    { header: "Email",            key: "email",           width: 28 },
    { header: "Phone",            key: "phone",           width: 16 },
    { header: "Website",          key: "website",         width: 24 },
    { header: "Stage",            key: "stage",           width: 14 },
    { header: "Sectors",          key: "sectors",         width: 20 },
    { header: "One Liner",        key: "oneLiner",        width: 36 },
    { header: "Problem",          key: "problem",         width: 36 },
    { header: "DPIIT Registered", key: "dpiitRegistered", width: 18 },
    { header: "Status",           key: "status",          width: 12 },
    { header: "Date",             key: "createdAt",       width: 20 },
  ],
  "lab-access": [
    { header: "ID",              key: "id",             width: 38 },
    { header: "Name",            key: "name",           width: 20 },
    { header: "Email",           key: "email",          width: 28 },
    { header: "Phone",           key: "phone",          width: 16 },
    { header: "Affiliation",     key: "affiliation",    width: 20 },
    { header: "Lab",             key: "lab",            width: 22 },
    { header: "Purpose",         key: "purpose",        width: 30 },
    { header: "Preferred Dates", key: "preferredDates", width: 18 },
    { header: "Status",          key: "status",         width: 12 },
    { header: "Date",            key: "createdAt",      width: 20 },
  ],
  internship: [
    { header: "ID",          key: "id",          width: 38 },
    { header: "Name",        key: "name",        width: 20 },
    { header: "Email",       key: "email",       width: 28 },
    { header: "Phone",       key: "phone",       width: 16 },
    { header: "College",     key: "college",     width: 24 },
    { header: "Degree",      key: "degree",      width: 16 },
    { header: "Year",        key: "year",        width: 10 },
    { header: "Area",        key: "area",        width: 20 },
    { header: "Duration",    key: "duration",    width: 14 },
    { header: "LinkedIn",    key: "linkedIn",    width: 30 },
    { header: "Resume Note", key: "resumeNote",  width: 30 },
    { header: "Status",      key: "status",      width: 12 },
    { header: "Date",        key: "createdAt",   width: 20 },
  ],
  feedback: [
    { header: "ID",       key: "id",        width: 38 },
    { header: "Name",     key: "name",      width: 20 },
    { header: "Email",    key: "email",     width: 28 },
    { header: "Category", key: "category",  width: 16 },
    { header: "Message",  key: "message",   width: 40 },
    { header: "Rating",   key: "rating",    width: 10 },
    { header: "Status",   key: "status",    width: 12 },
    { header: "Date",     key: "createdAt", width: 20 },
  ],
  careers: [
    { header: "ID",         key: "id",         width: 38 },
    { header: "Name",       key: "name",       width: 20 },
    { header: "Email",      key: "email",      width: 28 },
    { header: "Phone",      key: "phone",      width: 16 },
    { header: "Role",       key: "role",       width: 20 },
    { header: "Experience", key: "experience", width: 16 },
    { header: "Message",    key: "message",    width: 40 },
    { header: "Status",     key: "status",     width: 12 },
    { header: "Date",       key: "createdAt",  width: 20 },
  ],
  contact: [
    { header: "ID",      key: "id",        width: 38 },
    { header: "Name",    key: "name",      width: 20 },
    { header: "Email",   key: "email",     width: 28 },
    { header: "Phone",   key: "phone",     width: 16 },
    { header: "Purpose", key: "purpose",   width: 24 },
    { header: "Message", key: "message",   width: 40 },
    { header: "Status",  key: "status",    width: 12 },
    { header: "Date",    key: "createdAt", width: 20 },
  ],
};

function fmtVal(v: unknown): string {
  if (!v) return "";
  const s = String(v);
  // Format ISO timestamps to readable format
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.replace("T", " ").slice(0, 19);
  return Array.isArray(v) ? v.join("; ") : s;
}

function applyBorder(row: ExcelJS.Row, colCount: number) {
  for (let c = 1; c <= colCount; c++) {
    row.getCell(c).border = {
      top:    { style: "thin", color: { argb: "FFD0D0D0" } },
      bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
      left:   { style: "thin", color: { argb: "FFD0D0D0" } },
      right:  { style: "thin", color: { argb: "FFD0D0D0" } },
    };
  }
}

function buildSheet(
  ws: ExcelJS.Worksheet,
  type: SubmissionType,
  subs: (Submission & { id: string })[],
  startRow: number,
): number {
  const cols = COLS[type];
  const theme = TYPE_THEME[type];
  const colCount = cols.length;

  // ── Section heading row ──────────────────────────────────────────────────
  const headingRow = ws.getRow(startRow);
  headingRow.getCell(1).value = SECTION_LABELS[type];
  headingRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FF" + theme.text } };
  headingRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + theme.bg } };
  headingRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  // Merge across all columns
  ws.mergeCells(startRow, 1, startRow, colCount);
  headingRow.height = 22;
  headingRow.border = {
    top:    { style: "medium", color: { argb: "FF" + theme.text } },
    bottom: { style: "medium", color: { argb: "FF" + theme.text } },
    left:   { style: "medium", color: { argb: "FF" + theme.text } },
    right:  { style: "medium", color: { argb: "FF" + theme.text } },
  };

  // ── Column header row ────────────────────────────────────────────────────
  const headerRow = ws.getRow(startRow + 1);
  cols.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 10, color: { argb: "FF" + theme.text } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + theme.bg + "80" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.height = 18;
  applyBorder(headerRow, colCount);

  // ── Data rows ────────────────────────────────────────────────────────────
  let r = startRow + 2;
  if (subs.length === 0) {
    const emptyRow = ws.getRow(r);
    emptyRow.getCell(1).value = "(no submissions)";
    emptyRow.getCell(1).font = { italic: true, color: { argb: "FF999999" } };
    ws.mergeCells(r, 1, r, colCount);
    applyBorder(emptyRow, colCount);
    r++;
  } else {
    for (const sub of subs) {
      const s = sub as unknown as Record<string, unknown>;
      const dataRow = ws.getRow(r);
      cols.forEach((col, i) => {
        dataRow.getCell(i + 1).value = fmtVal(s[col.key]);
        dataRow.getCell(i + 1).font = { size: 10 };
        dataRow.getCell(i + 1).alignment = { wrapText: false, vertical: "middle" };
      });
      applyBorder(dataRow, colCount);
      r++;
    }
  }

  return r + 1; // +1 blank gap before next section
}

async function buildAllWorkbook(
  all: (Submission & { id: string })[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "IC IITP Admin";

  // One sheet per type
  for (const t of SUBMISSION_TYPES) {
    const theme = TYPE_THEME[t];
    const ws = wb.addWorksheet(SECTION_LABELS[t], {
      views: [{ state: "frozen", ySplit: 2 }],
      properties: { tabColor: { argb: "FF" + theme.text } },
    });

    // Set column widths
    ws.columns = COLS[t].map((c) => ({ width: c.width }));

    const subs = all.filter((s) => s.type === t);
    buildSheet(ws, t, subs, 1);
  }

  return wb.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

async function buildSingleWorkbook(
  t: SubmissionType,
  subs: (Submission & { id: string })[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "IC IITP Admin";
  const theme = TYPE_THEME[t];
  const ws = wb.addWorksheet(SECTION_LABELS[t], {
    views: [{ state: "frozen", ySplit: 2 }],
    properties: { tabColor: { argb: "FF" + theme.text } },
  });
  ws.columns = COLS[t].map((c) => ({ width: c.width }));
  buildSheet(ws, t, subs, 1);
  return wb.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}

export async function GET(req: NextRequest) {
  await requireAuth();

  const typeParam = req.nextUrl.searchParams.get("type") ?? "all";
  const mode = (typeParam === "all" || SUBMISSION_TYPES.includes(typeParam as SubmissionType))
    ? (typeParam as SubmissionType | "all")
    : "all";

  const date = new Date().toISOString().slice(0, 10);

  if (mode !== "all") {
    const t = mode as SubmissionType;
    const subs = await getSubmissions(t, 2000);
    const buf = await buildSingleWorkbook(t, subs);
    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="submissions-${mode}-${date}.xlsx"`,
      },
    });
  }

  const all = await getSubmissions(undefined, 2000);
  const buf = await buildAllWorkbook(all);
  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="submissions-all-${date}.xlsx"`,
    },
  });
}
