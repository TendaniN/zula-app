import { useTripStore } from "@/stores/tripStore";
import { Center, Group, Image, Stack, Text, Title } from "@mantine/core";
import { PiArrowRight, PiDotBold } from "react-icons/pi";
import noTripsImg from "@/assets/icons/empty-no-trips.svg";
import { TripModal } from "./components/TripModal";
import { Button } from "@/components/ui";

export default function TripsPage() {
  const { trips } = useTripStore();

  if (trips.length === 0) {
    return (
      <Stack>
        <Group justify="space-between">
          <Stack>
            <Title fw="bold">My trips</Title>
            <Text fz="sm" c="dimmed">
              Packed bags. Packed itinerary ✨
            </Text>
          </Stack>
        </Group>
        <Stack
          p="xl"
          bdrs="lg"
          bd="2px dashed var(--muted)"
          style={{
            backgroundColor:
              "light-dark(var(--mantine-color-white), var(--mantine-color-black))",
          }}
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
            <Image src={noTripsImg} w="8rem" h="6.5rem" />
            <Title order={3} ta="center" fw="semibold">
              No trips yet
            </Title>
            <Text c="dimmed" ta="center">
              Your next adventure starts here. Create a trip to add stays, plan
              your itinerary and track the budget.
            </Text>
            <TripModal
              trigger={(open) => (
                <Button rightSection={<PiArrowRight />} onClick={open}>
                  Plan your first trip
                </Button>
              )}
            />
          </Center>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Stack>
          <Title fw="bold">My trips</Title>
          <Group gap={2} c="dimmed">
            <Text fz="sm">{`${trips.length} trip${trips.length > 1 ? "s" : ""}`}</Text>
            <PiDotBold />
            <Text fz="sm">Packed bags. Packed itinerary ✨</Text>
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
}
