import {
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import noTransportsImg from "@/assets/icons/empty-transport.svg";
import { CanEditTrip } from "@/components/auth";
import { useTransportStore } from "@/stores/transportStore";
import { useEffect, useState } from "react";
import { TransportModal } from "./TransportModal";
import { TransportCard } from "./TransportCard";

interface TransportPanelProps {
  tripId: string;
}

export const TransportPanel = ({ tripId }: TransportPanelProps) => {
  const { transports, fetchByTrip } = useTransportStore();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async (id: string) => {
      await fetchByTrip(id);
      setInitialized(true);
    };

    load(tripId);
  }, [tripId]);

  if (!initialized) {
    return (
      <Stack flex={1}>
        <Center
          display="flex"
          style={{
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.75rem",
          }}
          p="xl"
        >
          <Loader size="xl" />
        </Center>
      </Stack>
    );
  }

  if (initialized && transports.length === 0) {
    return (
      <Stack
        p="xl"
        bdrs="lg"
        className="empty-state transport"
        bd="2px dashed var(--empty-card-border)"
        style={{
          backgroundColor:
            "light-dark(var(--mantine-color-white), var(--mantine-color-black))",
        }}
        flex={1}
      >
        <Center
          display="flex"
          style={{
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.75rem",
          }}
          p="xl"
        >
          <Image src={noTransportsImg} w="8rem" h="6.5rem" />
          <Title order={3} ta="center" fw="semibold">
            No journeys plans yet
          </Title>
          <Text c="dimmed" ta="center">
            Flights, trains, ferries, transfers, day trips - anything you travel
            on, between stops or out and back from one. Fares count toward the
            trip budget.
          </Text>
          <CanEditTrip>
            <TransportModal tripId={tripId} />
          </CanEditTrip>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack gap="md" flex={1} miw={0}>
      <Group justify="flex-end">
        <CanEditTrip>
          <TransportModal tripId={tripId} />
        </CanEditTrip>
      </Group>
      {transports.map((transport) => (
        <TransportCard tripId={tripId} transport={transport} />
      ))}
    </Stack>
  );
};
