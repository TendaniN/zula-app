import { useMemo, useState } from "react";
import {
  Card,
  Checkbox,
  Chip,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { LuDownload, LuFileSpreadsheet, LuPlus, LuInfo } from "react-icons/lu";

import {
  PACKING_SUGGESTIONS,
  NEED_TAG_LABELS,
  type PackingBag,
  type PackingNeedTag,
} from "@/constants/packing";

import { Button } from "@/components/ui/Button";

/**
 * Packing Panel. Constants provide the suggested items; everything mutable —
 * per-item quantity, the TWO tick states (packed / final check), custom items,
 * enabled need tags — is local state (v1: not persisted).
 *
 * Two checkboxes per item, mirroring the physical packing flow:
 *   ① Packed      — ticked as you pack over the days before departure
 *   ② Final check — ticked on departure day, the sweep before closing the bag
 *
 * Need tags are opt-in (makeup / bras / period-care / shaving hidden until
 * enabled), so the list is inclusive by default and never labelled by gender.
 */

interface CustomItem {
  id: string;
  bag: PackingBag;
  label: string;
}

const ALL_NEED_TAGS = Object.keys(NEED_TAG_LABELS) as PackingNeedTag[];
const ALL_BAGS = PACKING_SUGGESTIONS.map((g) => g.bag);

export const PackingPanel = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [packed, setPacked] = useState<Record<string, boolean>>({});
  const [final, setFinal] = useState<Record<string, boolean>>({});
  const [needTags, setNeedTags] = useState<PackingNeedTag[]>([]);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [draft, setDraft] = useState("");
  const [draftBag, setDraftBag] = useState<PackingBag>("Luggage");

  const qtyOf = (id: string) => quantities[id] ?? 1;
  const setQty = (id: string, value: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(1, value) }));

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) =>
    (id: string) =>
      setter((prev) => ({ ...prev, [id]: !prev[id] }));

  const togglePacked = toggle(setPacked);
  // Final check implies packed — tick both when the final check is set.
  const toggleFinal = (id: string) => {
    setFinal((prev) => {
      const next = !prev[id];
      if (next) setPacked((p) => ({ ...p, [id]: true }));
      return { ...prev, [id]: next };
    });
  };

  const groups = useMemo(() => {
    return PACKING_SUGGESTIONS.map((group) => {
      const base = group.items.filter(
        (item) => !item.needTag || needTags.includes(item.needTag),
      );
      const custom = customItems
        .filter((c) => c.bag === group.bag)
        .map((c) => ({ id: c.id, label: c.label, note: undefined }));
      return { ...group, items: [...base, ...custom] };
    }).filter((group) => group.items.length > 0);
  }, [needTags, customItems]);

  const visibleItems = groups.flatMap((g) => g.items);
  const packedCount = visibleItems.filter((i) => packed[i.id]).length;
  const finalCount = visibleItems.filter((i) => final[i.id]).length;

  const addCustom = () => {
    const label = draft.trim();
    if (!label) return;
    setCustomItems((items) => [
      ...items,
      { id: `custom-${Date.now()}`, bag: draftBag, label },
    ]);
    setDraft("");
  };

  const exportSheet = async () => {
    const { exportPackingXLSX } = await import("./exportPackingXLSX");
    await exportPackingXLSX({ groups, quantities, packed, final });
  };

  const downloadText = () => {
    const lines: string[] = [
      "Packing list",
      "(P = packed · F = final check)",
      "",
    ];
    for (const group of groups) {
      lines.push(group.bag.toUpperCase());
      for (const item of group.items) {
        const p = packed[item.id] ? "x" : " ";
        const f = final[item.id] ? "x" : " ";
        const qty = qtyOf(item.id);
        lines.push(`[${p}][${f}] ${item.label}${qty > 1 ? ` ×${qty}` : ""}`);
      }
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packing-list.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack gap="md" flex={1} miw={0}>
      {/* Header */}
      <Group justify="space-between" align="flex-end">
        <Stack gap={2}>
          <Text fw={800} size="lg">
            Packing list
          </Text>
          <Text size="sm" c="dimmed">
            {`${packedCount} packed · ${finalCount} final-checked · ${visibleItems.length} items`}
          </Text>
        </Stack>
        <Group gap="xs">
          <Button
            variant="ghost"
            leftSection={<LuDownload />}
            onClick={downloadText}
          >
            Text
          </Button>
          <Button
            variant="secondary"
            leftSection={<LuFileSpreadsheet />}
            onClick={exportSheet}
          >
            Export sheet
          </Button>
        </Group>
      </Group>

      {/* Legend for the two checkboxes */}
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="transparent" color="lavender" size="sm">
          <LuInfo size="0.85rem" />
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          Tick <b>①</b> as you pack, and <b>②</b> on departure day — the final
          sweep before you close the bag.
        </Text>
      </Group>

      {/* Opt-in need tags */}
      <Stack gap={6}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          What do you need to pack for?
        </Text>
        <Chip.Group
          multiple
          value={needTags}
          onChange={(v) => setNeedTags(v as PackingNeedTag[])}
        >
          <Group gap="xs">
            {ALL_NEED_TAGS.map((tag) => (
              <Chip key={tag} value={tag} variant="outline" radius="xl">
                {NEED_TAG_LABELS[tag]}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>

      {/* Bag groups */}
      {groups.map((group) => (
        <Card key={group.bag} p="md" shadow="sm">
          <Stack gap={2} mb="sm">
            <Title order={5} fw="bold">
              {group.bag}
            </Title>
            {group.description && (
              <Text size="xs" c="dimmed">
                {group.description}
              </Text>
            )}
          </Stack>

          <Stack gap={0}>
            {group.items.map((item) => (
              <Group
                key={item.id}
                justify="space-between"
                wrap="nowrap"
                gap="sm"
                py="xs"
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                  {/* ① Packed */}
                  <Tooltip label="Packed" withArrow>
                    <Checkbox
                      checked={!!packed[item.id]}
                      onChange={() => togglePacked(item.id)}
                      aria-label={`Packed ${item.label}`}
                    />
                  </Tooltip>
                  {/* ② Final check */}
                  <Tooltip label="Final check" withArrow>
                    <Checkbox
                      color="mint"
                      checked={!!final[item.id]}
                      onChange={() => toggleFinal(item.id)}
                      aria-label={`Final check ${item.label}`}
                    />
                  </Tooltip>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={600}
                      td={final[item.id] ? "line-through" : undefined}
                      c={packed[item.id] ? "dimmed" : undefined}
                      truncate
                    >
                      {item.label}
                    </Text>
                    {item.note && (
                      <Text size="xs" c="dimmed" truncate>
                        {item.note}
                      </Text>
                    )}
                  </Stack>
                </Group>

                <NumberInput
                  value={qtyOf(item.id)}
                  onChange={(v) => setQty(item.id, Number(v) || 1)}
                  min={1}
                  max={99}
                  size="xs"
                  w={72}
                  style={{ flexShrink: 0 }}
                  aria-label={`Quantity of ${item.label}`}
                />
              </Group>
            ))}
          </Stack>
        </Card>
      ))}

      {/* Add your own */}
      <Card p="md" shadow="sm">
        <Group gap="sm" wrap="nowrap" align="flex-end">
          <TextInput
            style={{ flex: 1 }}
            label="Add your own"
            placeholder="Something not on the list…"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustom();
            }}
          />
          <Select
            label="Bag"
            w={150}
            data={ALL_BAGS}
            value={draftBag}
            onChange={(v) => setDraftBag((v as PackingBag) ?? "Luggage")}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
          />
          <Button
            leftSection={<LuPlus />}
            onClick={addCustom}
            disabled={!draft.trim()}
          >
            Add
          </Button>
        </Group>
      </Card>
    </Stack>
  );
};
