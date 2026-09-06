import { useState, type ReactNode } from "react";
import { Group, Stack, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import {
  LuFileSpreadsheet,
  LuFileText,
  LuPresentation,
  LuDownload,
} from "react-icons/lu";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { PiDownloadSimpleBold } from "react-icons/pi";

import { Button, IconButton, Modal } from "@/components/ui";
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
  opened?: boolean;
  onClose?: () => void;
}

export const ExportModal = ({
  trip,
  opened: openedProp,
  onClose,
}: ExportModalProps) => {
  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);
  const [exporting, setExporting] = useState<null | "xlsx" | "pdf" | "pptx">(
    null,
  );

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const handleDownload = async (type: ExportTypeValues) => {
    setExporting(type);
    switch (type) {
      case "pdf": {
        const { exportTripPDF } = await import("@/utils/export/exportTripPDF");
        exportTripPDF(
          trip as TripSummaryRow & {
            start_date: string;
            end_date: string;
          },
        );
        break;
      }
      case "pptx": {
        const { exportTripPPT } = await import("@/utils/export/exportTripPPT");
        exportTripPPT(
          trip as TripSummaryRow & {
            start_date: string;
            end_date: string;
          },
        );
        break;
      }
      default: {
        const { exportTripXLSX } =
          await import("@/utils/export/exportTripXLSX");
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
      <Modal opened={opened} close={close} title="Export trip" size="md">
        <Stack gap="md" p="lg">
          <Text size="sm" c="dimmed">
            Generated live from your stays, transport & budget.
          </Text>

          <Stack gap="sm">
            {EXPORT_OPTIONS.map((option) => (
              <Group
                key={`export-${option.type}`}
                justify="space-between"
                wrap="nowrap"
                p="sm"
                gap="sm"
                bd="2px solid var(--border-color)"
                bdrs="lg"
              >
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <ThemeIcon
                    variant="light"
                    size="xl"
                    bd={`2px solid var(--mantine-color-${option.color}-5)`}
                    color={option.color}
                  >
                    {option.icon}
                  </ThemeIcon>
                  <Stack gap={0} miw={0}>
                    <Text fw="bold" size="sm" truncate>
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
                  loading={exporting === option.type}
                />
              </Group>
            ))}
          </Stack>
        </Stack>
      </Modal>

      {isSmallScreen ? (
        <IconButton
          variant="ghost"
          icon={<PiDownloadSimpleBold />}
          onClick={open}
          aria-label="Export Trip Information"
        />
      ) : (
        <Button
          variant="ghost"
          leftSection={<PiDownloadSimpleBold />}
          onClick={open}
          size="md"
        >
          Export
        </Button>
      )}
    </>
  );
};
