import { Button } from "@/components/ui";
import { Box, Group, Image, Modal, Stack, Text, Title } from "@mantine/core";
import { useOnboardStore } from "@/stores/onboardStore";
import { startTour } from "@/stores/tour";
import { useDisclosure } from "@mantine/hooks";
import welcomeGif from "@/assets/gifs/welcome.gif";

interface OnboardingModalProps {
  name: string | null;
  userId: string | null;
}

export const OnboardingModal = ({ name, userId }: OnboardingModalProps) => {
  const { onboarded, complete } = useOnboardStore();

  const [opened, { close }] = useDisclosure(
    onboarded !== null ? !onboarded : false,
  );

  const handleShowMeAround = () => {
    close();

    startTour({
      onComplete: () => userId && complete(userId),
    });
  };

  return (
    <Modal opened={opened} onClose={close} size="lg" radius="lg" centered>
      <Stack gap="md">
        <Box
          bdrs="md"
          bd="2px solid var(--border-color)"
          style={{
            overflow: "hidden",
          }}
        >
          <Image
            src={welcomeGif}
            alt="Live preview"
            w="100%"
            h="auto"
            display="block"
          />
        </Box>
        <Stack gap={0}>
          <Title order={3} fw="bold" c="var(--text-color)">
            {`Welcome to Zula${name ? `, ${name}` : ""}`}
          </Title>
          <Text c="dimmed" size="sm">
            One page per trip: where you sleep, how you get there, what’s left
            to book, and what it all costs. Want the 60-second walkthrough, or
            would you rather poke around?
          </Text>
        </Stack>
        <Group grow style={{ flexShrink: 0 }}>
          <Button onClick={() => handleShowMeAround()}>Show me around</Button>
          <Button variant="ghost" onClick={close}>
            I'll look around myself
          </Button>
        </Group>
        <Text size="xs" c="dimmed" ta="center">
          Either way, the tour stays in Help → Start the tour.
        </Text>
      </Stack>
    </Modal>
  );
};
