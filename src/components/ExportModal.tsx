import { type ReactNode } from "react";
import { Group, Modal, Stack, Text, Title } from "@mantine/core";
import {
  LuFileSpreadsheet,
  LuFileText,
  LuPresentation,
  LuDownload,
  LuX,
} from "react-icons/lu";
import { useDisclosure } from "@mantine/hooks";

import { IconButton } from "@/components/ui";
import { exportTripXLSX, exportTripPDF, exportTripPPT } from "@/utils/export";
import type { TripSummaryRow } from "@/types/models";

type ExportTypeValues = "xlsx" | "pdf" | "pptx";

interface ExportOption {
  type: ExportTypeValues;
  label: string;
  extension: string;
  description: string;
  color: string;
  icon: ReactNode;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    type: "xlsx",
    label: "Spreadsheet",
    extension: ".xlsx",
    description: "Itemised costs per stay & activity",
    color: "mint",
    icon: <LuFileSpreadsheet />,
  },
  {
    type: "pdf",
    label: "Document",
    extension: ".pdf",
    description: "Printable day-by-day itinerary",
    color: "peach",
    icon: <LuFileText />,
  },
  {
    type: "pptx",
    label: "Slides",
    extension: ".pptx",
    description: "Share-ready trip pitch deck",
    color: "lavender",
    icon: <LuPresentation />,
  },
];

interface ExportModalProps {
  trip: TripSummaryRow;
  trigger?: (open: () => void) => ReactNode;
  opened?: boolean;
  onClose?: () => void;
}

export const ExportModal = ({
  trip,
  trigger,
  opened: openedProp,
  onClose,
}: ExportModalProps) => {
  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const handleDownload = (type: ExportTypeValues) => {
    switch (type) {
      case "pdf": {
        exportTripPDF(
          trip as TripSummaryRow & {
            start_date: string;
            end_date: string;
          },
        );
        break;
      }
      case "pptx": {
        exportTripPPT(
          trip as TripSummaryRow & {
            start_date: string;
            end_date: string;
          },
        );
        break;
      }
      default: {
        exportTripXLSX(
          trip as TripSummaryRow & {
            start_date: string;
            end_date: string;
          },
        );
        break;
      }
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size="md"
        radius="lg"
        padding={0}
        title={null}
        withCloseButton={false}
        overlayProps={{ blur: 2 }}
      >
        {/* Banner header */}
        <Group
          justify="space-between"
          px="lg"
          py="md"
          style={{
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <Title order={3} fw="bold" c="var(--text-color)">
            Export trip
          </Title>
          <IconButton
            icon={<LuX />}
            variant="ghost"
            aria-label="Close"
            onClick={close}
          />
        </Group>

        <Stack gap="md" p="lg">
          <Text size="sm" c="dimmed">
            Generated live from your stays, transport & budget.
          </Text>

          <Stack gap="sm">
            {EXPORT_OPTIONS.map((option) => (
              <Group
                key={option.type}
                justify="space-between"
                wrap="nowrap"
                p="sm"
                gap="sm"
                bd="2px solid var(--border-color)"
                bdrs="lg"
              >
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <Group
                    justify="center"
                    align="center"
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: "var(--mantine-radius-md)",
                      border: `2px solid var(--mantine-color-${option.color}-5)`,
                      background: `var(--mantine-color-${option.color}-1)`,
                      color: `var(--mantine-color-${option.color}-7)`,
                    }}
                  >
                    {option.icon}
                  </Group>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Text fw={700} size="sm" truncate>
                      {`${option.label} · ${option.extension}`}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {option.description}
                    </Text>
                  </Stack>
                </Group>

                <IconButton
                  icon={<LuDownload />}
                  aria-label={`Download ${option.label}`}
                  onClick={() => handleDownload(option.type)}
                  variant="secondary"
                />
              </Group>
            ))}
          </Stack>
        </Stack>
      </Modal>

      {isControlled ? null : trigger?.(open)}
    </>
  );
};
