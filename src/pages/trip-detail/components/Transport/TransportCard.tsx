import { Button, IconButton } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import type { Transport } from "@/types/models";
import { formatDate } from "@/utils/date";
import { formatDuration } from "@/utils/formatDuration";
import {
  Badge,
  Card,
  Divider,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaPencil, FaRegTrashCan, FaTrash } from "react-icons/fa6";
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
import { CanEditTrip } from "@/components/auth";
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
        <Group flex={1} justify="space-between">
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
          <Group>
            <Text fw={800} size="lg" my="auto">
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
          </Group>
        </Group>
        <TransportModal
          transport={transport}
          tripId={tripId}
          opened={editOpened}
          onClose={closeEdit}
        />
        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          centered
          size="sm"
          title={
            <Stack gap="xs">
              <ThemeIcon color="red" radius="md">
                <FaTrash />
              </ThemeIcon>
              <Title order={4} lh={1} fw="bold">
                Delete this transport?
              </Title>
            </Stack>
          }
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              {`Delete "${name}"? This can't be undone.`}
            </Text>
            <Group grow>
              <Button fluid variant="ghost" onClick={closeDelete}>
                Cancel
              </Button>
              <Button fluid variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Group>
    </Card>
  );
};
