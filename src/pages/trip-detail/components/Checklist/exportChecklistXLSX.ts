import ExcelJS from "exceljs";
import type { DepartureCategory } from "@/constants/checklist";

/**
 * Departure checklist → XLSX. A single "Done" tick column (these are one-time
 * tasks), then Category / Task / Notes. The Done column renders as a bordered
 * box — empty ones print as squares to tick by hand, plus a light "✓" dropdown
 * so it's tickable digitally. Reflects the panel's current done state.
 */

interface ExportItem {
  id: string;
  label: string;
  note?: string;
  packingHint?: string;
}

interface ExportGroup {
  category: DepartureCategory;
  items: ExportItem[];
}

interface ExportParams {
  groups: ExportGroup[];
  done?: Record<string, boolean>;
  fileName?: string;
}

const thin = { style: "thin" as const, color: { argb: "FFBBBBBB" } };
const allBorders: Partial<ExcelJS.Borders> = {
  top: thin,
  left: thin,
  bottom: thin,
  right: thin,
};

export const exportDepartureXLSX = async ({
  groups,
  done = {},
  fileName = "departure-checklist",
}: ExportParams) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zula";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Before you leave", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "Done", key: "done", width: 6 },
    { header: "Category", key: "category", width: 22 },
    { header: "Task", key: "task", width: 34 },
    { header: "Notes", key: "notes", width: 40 },
  ];

  const header = ws.getRow(1);
  header.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = allBorders;
  });

  for (const group of groups) {
    for (const item of group.items) {
      // Fold the packing cross-ref into the notes column for the sheet.
      const notes = [item.note, item.packingHint ? `→ ${item.packingHint}` : ""]
        .filter(Boolean)
        .join(" · ");
      const row = ws.addRow({
        done: done[item.id] ? "✓" : "",
        category: group.category,
        task: item.label,
        notes,
      });
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = allBorders;
      });
      row.getCell("done").alignment = { horizontal: "center" };
      row.getCell("notes").alignment = { horizontal: "right" };
    }
  }

  for (let r = 2; r <= ws.rowCount; r++) {
    ws.getCell(`A${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"✓"'],
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
