import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Card,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { LuDownload, LuFileSpreadsheet, LuPlus, LuInfo } from "react-icons/lu";

import { Button } from "@/components/ui/Button";

import {
  DEPARTURE_CHECKLIST,
  type DepartureCategory,
  type DepartureItem,
} from "@/constants/checklist";

interface CustomTask {
  id: string;
  category: DepartureCategory;
  label: string;
}

const ALL_CATEGORIES = DEPARTURE_CHECKLIST.map((g) => g.category);

export const ChecklistPanel = () => {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] =
    useState<DepartureCategory>("Home & security");

  const toggle = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const groups = useMemo(() => {
    return DEPARTURE_CHECKLIST.map((group) => {
      const custom: DepartureItem[] = customTasks
        .filter((c) => c.category === group.category)
        .map((c) => ({ id: c.id, label: c.label }));
      return { ...group, items: [...group.items, ...custom] };
    });
  }, [customTasks]);

  const allItems = groups.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => done[i.id]).length;

  const addCustom = () => {
    const label = draft.trim();
    if (!label) return;
    setCustomTasks((tasks) => [
      ...tasks,
      { id: `custom-${Date.now()}`, category: draftCategory, label },
    ]);
    setDraft("");
  };

  const exportSheet = async () => {
    const { exportDepartureXLSX } = await import("./exportChecklistXLSX");
    await exportDepartureXLSX({ groups, done });
  };

  const downloadText = () => {
    const lines: string[] = ["Before you leave", ""];
    for (const group of groups) {
      lines.push(group.category.toUpperCase());
      for (const item of group.items) {
        lines.push(`[${done[item.id] ? "x" : " "}] ${item.label}`);
      }
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departure-checklist.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack gap="md" flex={1} miw={0}>
      {/* Header */}
      <Group justify="space-between" align="flex-end">
        <Stack gap={0}>
          <Group>
            <Text fw={800} size="lg">
              Before you leave
            </Text>
            <Badge
              size="sm"
              color="peach"
            >{`${doneCount} of ${allItems.length} done`}</Badge>
          </Group>
          <Text size="sm" c="dimmed">
            The non-packing stuff - home, mail, money, people, devices.
          </Text>
        </Stack>

        <Group gap="xs">
          <Button
            variant="ghost"
            size="sm"
            leftSection={<LuDownload />}
            onClick={downloadText}
          >
            Text
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftSection={<LuFileSpreadsheet />}
            onClick={exportSheet}
          >
            Export sheet
          </Button>
        </Group>
      </Group>

      {/* Category cards */}
      {groups.map((group) => (
        <Card key={group.category} p={0} shadow="sm">
          {/* Header strip */}
          <Box
            px="md"
            py="sm"
            bg="lavender.6"
            style={{
              borderBottom: "2px solid var(--border-color)",
            }}
          >
            <Text fw={800} size="sm">
              {group.category}
            </Text>
          </Box>

          <Stack gap={0} px="md">
            {group.items.map((item, i) => (
              <Group
                key={item.id}
                wrap="nowrap"
                gap="sm"
                py="sm"
                align="flex-start"
                style={
                  i > 0
                    ? { borderTop: "1px solid var(--border-color)" }
                    : undefined
                }
              >
                <Checkbox
                  checked={!!done[item.id]}
                  onChange={() => toggle(item.id)}
                  aria-label={item.label}
                  mt={2}
                />
                <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Text
                    size="sm"
                    fw={500}
                    td={done[item.id] ? "line-through" : undefined}
                    c={done[item.id] ? "dimmed" : undefined}
                  >
                    {item.label}
                    {item.packingHint && (
                      <Text component="span" size="xs" c="peach.7">
                        {` (in your ${item.packingHint})`}
                      </Text>
                    )}
                  </Text>
                  {item.note && (
                    <Text size="xs" c="dimmed">
                      {item.note}
                    </Text>
                  )}
                </Stack>
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
            placeholder="Another thing to do before you leave…"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addCustom();
            }}
          />
          <Select
            label="Category"
            w={190}
            data={ALL_CATEGORIES}
            value={draftCategory}
            onChange={(v) =>
              setDraftCategory((v as DepartureCategory) ?? "Home & security")
            }
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

      {/* Cross-ref note */}
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="transparent" color="lavender" size="sm">
          <LuInfo size="0.85rem" />
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          Items marked "in your packing list" live over on the Packing panel —
          no need to tick them twice.
        </Text>
      </Group>
    </Stack>
  );
};
