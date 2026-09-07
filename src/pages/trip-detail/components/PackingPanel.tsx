import { useMemo, useState } from "react";
import {
  Card,
  Checkbox,
  Chip,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { LuDownload, LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/Button";

import {
  PACKING_SUGGESTIONS,
  NEED_TAG_LABELS,
  type PackingBag,
  type PackingNeedTag,
} from "@/constants/packing";

/**
 * Packing Panel. The constants provide the suggested item list; everything
 * mutable — quantity per item, what's ticked, custom items, which opt-in need
 * tags are on — lives in local state here (v1: not persisted). A traveller
 * tailors the list, then downloads it to take offline.
 *
 * Need tags are opt-in: makeup / bras / period-care / shaving items are hidden
 * until the traveller enables that tag, so the list is inclusive by default and
 * never labelled by gender.
 */

interface CustomItem {
  id: string;
  bag: PackingBag;
  label: string;
}

const ALL_NEED_TAGS = Object.keys(NEED_TAG_LABELS) as PackingNeedTag[];

export const PackingPanel = () => {
  // Per-item quantity (defaults to 1 when first shown). Keyed by item id.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  // Ticked ("packed") state, keyed by item id.
  const [packed, setPacked] = useState<Record<string, boolean>>({});
  // Which opt-in need tags are enabled (default none — universal base only).
  const [needTags, setNeedTags] = useState<PackingNeedTag[]>([]);
  // User-added items.
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [draft, setDraft] = useState("");
  const [draftBag, setDraftBag] = useState<PackingBag>("Luggage");

  const qtyOf = (id: string) => quantities[id] ?? 1;
  const setQty = (id: string, value: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(1, value) }));
  const togglePacked = (id: string) =>
    setPacked((p) => ({ ...p, [id]: !p[id] }));

  // Build the visible, filtered groups (base items + custom, need-tag gated).
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

  const addCustom = () => {
    const label = draft.trim();
    if (!label) return;
    setCustomItems((items) => [
      ...items,
      { id: `custom-${Date.now()}`, bag: draftBag, label },
    ]);
    setDraft("");
  };

  const download = () => {
    const lines: string[] = ["Packing list", ""];
    for (const group of groups) {
      lines.push(group.bag.toUpperCase());
      for (const item of group.items) {
        const mark = packed[item.id] ? "[x]" : "[ ]";
        const qty = qtyOf(item.id);
        lines.push(`${mark} ${item.label}${qty > 1 ? ` ×${qty}` : ""}`);
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
            {`${packedCount} of ${visibleItems.length} packed`}
          </Text>
        </Stack>
        <Button variant="ghost" leftSection={<LuDownload />} onClick={download}>
          Download
        </Button>
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
                  <Checkbox
                    checked={!!packed[item.id]}
                    onChange={() => togglePacked(item.id)}
                    aria-label={`Packed ${item.label}`}
                  />
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text
                      size="sm"
                      fw={600}
                      td={packed[item.id] ? "line-through" : undefined}
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
                  hideControls={false}
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
          <Chip.Group
            multiple={false}
            value={draftBag}
            onChange={(v) => setDraftBag(v as PackingBag)}
          >
            {/* Simple bag picker — swap for a Select if you prefer */}
          </Chip.Group>
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
