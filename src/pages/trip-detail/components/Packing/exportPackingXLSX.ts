import ExcelJS from "exceljs";
import { BAG_PARENT, type PackingBag } from "@/constants/packing";

/**
 * Packing list → XLSX, matching the two-checkbox packing sheet: a "Pack"
 * column (tick as you pack over the days) and a "Final" column (the departure-
 * day sweep before you close the bag), then Bag / Sub-bag / Qty / Item / Notes.
 *
 * The tick columns render as bordered boxes — empty ones print as squares you
 * tick by hand, and each also carries a light "✓" dropdown so they're tickable
 * digitally in Excel / Google Sheets. (True Google-Sheets checkboxes aren't an
 * XLSX feature; add them via Insert → Checkbox after opening if you want them.)
 *
 * Reflects the panel's current state — filtered items, quantities, and any
 * ticks already made carry through.
 */

interface ExportItem {
  id: string;
  label: string;
  note?: string;
}

interface ExportGroup {
  bag: PackingBag;
  items: ExportItem[];
}

interface ExportParams {
  groups: ExportGroup[];
  quantities: Record<string, number>;
  packed?: Record<string, boolean>;
  final?: Record<string, boolean>;
  fileName?: string;
}

const thin = { style: "thin" as const, color: { argb: "FFBBBBBB" } };
const allBorders: Partial<ExcelJS.Borders> = {
  top: thin,
  left: thin,
  bottom: thin,
  right: thin,
};

export const exportPackingXLSX = async ({
  groups,
  quantities,
  packed = {},
  final = {},
  fileName = "packing-list",
}: ExportParams) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Zula";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Packing list", {
    views: [{ state: "frozen", ySplit: 1 }], // keep the header visible
  });

  ws.columns = [
    { header: "Pack", key: "pack", width: 6 },
    { header: "Final", key: "final", width: 6 },
    { header: "Bag", key: "bag", width: 14 },
    { header: "Sub-bag", key: "sub", width: 14 },
    { header: "Qty", key: "qty", width: 6 },
    { header: "Item", key: "item", width: 28 },
    { header: "Notes", key: "notes", width: 42 },
  ];

  // Header styling.
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

  const tick = (v: boolean | undefined) => (v ? "✓" : "");

  for (const group of groups) {
    const parts = BAG_PARENT[group.bag];
    for (const item of group.items) {
      const qty = quantities[item.id] ?? 1;
      const row = ws.addRow({
        pack: tick(packed[item.id]),
        final: tick(final[item.id]),
        bag: parts.parent,
        sub: parts.sub ?? "",
        qty,
        item: item.label,
        notes: item.note ?? "",
      });

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = allBorders;
      });
      row.getCell("pack").alignment = { horizontal: "center" };
      row.getCell("final").alignment = { horizontal: "center" };
      row.getCell("qty").alignment = { horizontal: "center" };
      row.getCell("notes").alignment = { horizontal: "right" };
    }
  }

  // Light "✓" dropdown on both tick columns, every data row.
  for (let r = 2; r <= ws.rowCount; r++) {
    for (const col of ["A", "B"]) {
      ws.getCell(`${col}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"✓"'],
      };
    }
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
