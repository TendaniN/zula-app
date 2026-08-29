import { IconButton, DeleteModal, CanEditTrip } from "@/components";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Transport } from "@/types/models";
import { formatDate } from "@/utils/date";
import { formatDuration } from "@/utils/formatDuration";
import {
  Badge,
  Card,
  Divider,
  Flex,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import {
  PiSubway,
  PiBus,
  PiCar,
  PiTrain,
  PiPaperPlaneTilt,
  PiBoat,
  PiDotsThreeOutlineFill,
} from "react-icons/pi";
import { TransportModal } from "./TransportModal";
import { useTransportStore } from "@/stores/transportStore";

const TYPE_COLOR: Record<Transport["type"], string> = {
  flight: "lavender",
  train: "mint",
  bus: "peach",
  car: "peach",
  ferry: "lavender",
  metro: "mint",
  other: "gray",
};

const TYPE_LABEL: Record<Transport["type"], string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  car: "Car",
  ferry: "Ferry",
  metro: "Metro",
  other: "Other",
};

const TYPE_ICON: Record<Transport["type"], React.ReactNode> = {
  flight: <PiPaperPlaneTilt />,
  train: <PiTrain />,
  bus: <PiBus />,
  car: <PiCar />,
  ferry: <PiBoat />,
  metro: <PiSubway />,
  other: <PiDotsThreeOutlineFill />,
};

interface TransportCardProps {
  tripId: string;
  transport: Transport;
}

export const TransportCard = ({ tripId, transport }: TransportCardProps) => {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const { type, name, start_date, end_date, duration_minutes, cost } =
    transport;

  const currency = useCurrencyStore((s) => s.symbol);
  const deleteTransport = useTransportStore((s) => s.deleteTransport);

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const dateRange =
    start_date && end_date
      ? `${formatDate(start_date, "MMM D · H:mm")} → ${formatDate(end_date, "D MMM · H:mm")}`
      : "Dates TBC";

  const confirmDelete = async () => {
    await deleteTransport(transport.id);
    closeDelete();
  };

  return (
    <Card
      radius="lg"
      p="md"
      shadow="xl"
      style={{
        boxShadow: `0 4px 0 var(--bg-secondary)`,
      }}
    >
      <Group>
        <Divider
          size="lg"
          orientation="vertical"
          bdrs="md"
          color={`${TYPE_COLOR[type]}.3`}
        />
        <ThemeIcon
          size="xl"
          radius="sm"
          variant="light"
          color={TYPE_COLOR[type]}
          bd="2px solid var(--border-color)"
        >
          {TYPE_ICON[type]}
        </ThemeIcon>
        <Flex
          flex={1}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
        >
          <Stack gap={4}>
            <Group>
              <Text fw="bold" size="sm">
                {name}
              </Text>
              <Badge
                variant="filled"
                color={`${TYPE_COLOR[type]}.3`}
                c="var(--border-color)"
                tt="capitalize"
                bd={`2px solid ${TYPE_COLOR[type]}.5`}
              >
                {TYPE_LABEL[type]}
              </Badge>
            </Group>
            <Group>
              <Text size="xs" c="dimmed">
                {dateRange}
              </Text>
              <Text size="xs" c="dimmed">
                -
              </Text>
              <Text size="xs" c="dimmed">
                {formatDuration(duration_minutes)}
              </Text>
            </Group>
          </Stack>
          <Flex justify={isSmallScreen ? "space-between" : "flex-end"} gap="sm">
            <Text fw={800} my="auto" fz={{ base: "md", sm: "lg" }}>
              {currency}
              {cost.toLocaleString()}
            </Text>
            <CanEditTrip>
              <Menu position="bottom-end" withinPortal shadow="md">
                <Menu.Target>
                  <IconButton
                    icon={<PiDotsThreeOutlineFill />}
                    variant="ghost"
                    size="sm"
                    aria-label="Location options"
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<FaPencil />} onClick={openEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<FaRegTrashCan />}
                    onClick={openDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </CanEditTrip>
          </Flex>
        </Flex>
        <TransportModal
          transport={transport}
          tripId={tripId}
          opened={editOpened}
          onClose={closeEdit}
        />
        <DeleteModal
          opened={deleteOpened}
          close={closeDelete}
          confirm={confirmDelete}
          item="transport"
          name={name}
        />
      </Group>
    </Card>
  );
};
