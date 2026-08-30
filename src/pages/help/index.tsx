import { useMemo, useState } from "react";
import {
  Accordion,
  Anchor,
  Badge,
  Box,
  Card,
  Chip,
  Grid,
  Group,
  Image,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  PiMagnifyingGlassBold,
  PiPlayCircleBold,
  PiEnvelopeSimpleBold,
  PiClockBold,
  PiSparkleBold,
  PiXBold,
} from "react-icons/pi";
import { Button, IconButton } from "@/components";

import { FeedbackModal } from "@/components/FeedbackModal";
import { FAQ_SECTIONS, WHATS_NEW, QUICK_STARTS } from "./constants";

import tourLoopGif from "@/assets/gifs/tour-loop.gif";
import tourLoopMobileGif from "@/assets/gifs/tour-loop-mobile.gif";

const SUPPORT_EMAIL = "help@zula.travel";

interface LightboxContent {
  title: string;
  blurb: string;
  gif: string;
  gifMobile?: string;
}

export default function HelpPage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const [search, setSearch] = useState("");
  const [section, setSection] = useState<string>("All");
  const [lightbox, setLightbox] = useState<LightboxContent | null>(null);

  const sections = useMemo(
    () => ["All", ...FAQ_SECTIONS.map((s) => s.section)],
    [],
  );

  // Flatten + filter FAQ by chip and search.
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ_SECTIONS.flatMap((s) =>
      s.items.map((item) => ({ ...item, section: s.section })),
    ).filter((item) => {
      const inSection = section === "All" || item.section === section;
      const inSearch =
        !q ||
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q);
      return inSection && inSearch;
    });
  }, [search, section]);

  return (
    <Stack h="100%" p={0} gap={0} mih={0}>
      {/* Header — stays put while the body scrolls */}
      <Stack
        bg="var(--surface-color)"
        style={{ borderBottom: "2px solid var(--border-color)" }}
        px={{ base: "lg", sm: "xl" }}
        py="md"
        gap="sm"
      >
        <Stack gap={2}>
          <Title fw="bold">Help &amp; support</Title>
          <Text fz="md" c="dimmed">
            Short answers first. Everything here is one page of copy — no ticket
            queue to read.
          </Text>
        </Stack>
        <TextInput
          size="md"
          radius="md"
          placeholder='Search help — try "budget" or "read-only"'
          leftSection={<PiMagnifyingGlassBold />}
          rightSection={
            search !== "" && (
              <IconButton
                size="xs"
                variant="ghost"
                icon={<PiXBold />}
                aria-label="Clear search"
                onClick={() => setSearch("")}
              />
            )
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Stack>

      <ScrollArea flex={1} mih={0} type="auto" offsetScrollbars>
        <Box p={{ base: "lg", sm: "xl" }}>
          <Grid gap="xl">
            {/* ---- Main column ---- */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="xl">
                {/* Quick starts */}
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-end">
                    <Title order={3} fw="bold">
                      Quick starts
                    </Title>
                    <Text size="sm" c="dimmed" visibleFrom="sm">
                      Each one is a looping GIF, not a video player
                    </Text>
                  </Group>

                  <Grid gap="md">
                    {QUICK_STARTS.map((qs) => (
                      <Grid.Col key={qs.id} span={{ base: 12, xs: 6, lg: 4 }}>
                        <QuickStartCard
                          quickStart={qs}
                          onOpen={() =>
                            setLightbox({
                              title: qs.title,
                              blurb: qs.blurb,
                              gif: qs.gif,
                            })
                          }
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>

                {/* FAQ */}
                <Stack gap="sm">
                  <Chip.Group
                    multiple={false}
                    value={section}
                    onChange={(v) => setSection((v as string) || "All")}
                  >
                    <Group gap="xs">
                      {sections.map((s) => (
                        <Chip
                          icon={null}
                          key={s}
                          value={s}
                          size="md"
                          radius="xl"
                          color="lavender"
                          fw="bold"
                          styles={{
                            checkIcon: { display: "none" },
                            label: {
                              padding: "0.25rem 1rem",
                              border: "2px solid var(--border-color)",
                              fontSize: "var(--mantine-font-size-sm)",
                              color: "var(--text-color)",
                            },
                          }}
                        >
                          {s}
                        </Chip>
                      ))}
                    </Group>
                  </Chip.Group>

                  <Text size="sm" c="dimmed">
                    {`${results.length} ${results.length === 1 ? "answer" : "answers"}`}
                  </Text>

                  {results.length === 0 ? (
                    <Card p="lg">
                      <Text size="sm" c="dimmed">
                        No answers match that yet. Try a different word, or
                        message support below — send the trip link and we'll
                        look at the exact plan.
                      </Text>
                    </Card>
                  ) : (
                    <Accordion variant="separated" radius="lg">
                      {results.map((item) => (
                        <Accordion.Item
                          key={item.q}
                          value={item.q}
                          bd="2px solid var(--muted)"
                        >
                          <Accordion.Control>
                            <Text fw={600} size="sm">
                              {item.q}
                            </Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack>
                              <Text size="sm" c="dimmed">
                                {item.a}
                              </Text>
                              <Badge variant="light" tt="capitalize">
                                {item.section}
                              </Badge>
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  )}
                </Stack>
              </Stack>
            </Grid.Col>

            {/* ---- Sidebar column ---- */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                {/* 60-second tour */}
                <Card p="lg">
                  <Stack gap="sm">
                    <Title order={4} fw="bold">
                      The 60-second tour
                    </Title>
                    <GifPlaceholder
                      accent="lavender"
                      label="tour-loop.gif"
                      onOpen={() =>
                        setLightbox({
                          title: "The 60-second tour",
                          blurb:
                            "Five coach-marks over a real trip: trips list, tabs, stays, costs, sharing.",
                          gif: tourLoopGif,
                          gifMobile: tourLoopMobileGif,
                        })
                      }
                    />
                    <Text size="sm" c="dimmed">
                      Five coach-marks over a real trip: trips list, tabs,
                      stays, costs, sharing.
                    </Text>
                    <Button
                      leftSection={<PiPlayCircleBold />}
                      fluid
                      onClick={() =>
                        setLightbox({
                          title: "The 60-second tour",
                          blurb:
                            "Five coach-marks over a real trip: trips list, tabs, stays, costs, sharing.",
                          gif: tourLoopGif,
                          gifMobile: tourLoopMobileGif,
                        })
                      }
                    >
                      Start the tour
                    </Button>
                  </Stack>
                </Card>

                {/* Still stuck? — mailto, no backend needed */}
                <Card p="lg">
                  <Stack gap="sm">
                    <Title order={4} fw="bold">
                      Still stuck?
                    </Title>
                    <Text size="sm" c="dimmed">
                      Send the trip link with your message and we can look at
                      the exact plan.
                    </Text>
                    <Group gap="xs">
                      <ThemeIcon
                        variant="light"
                        color="lavender"
                        size="sm"
                        radius="xl"
                      >
                        <PiEnvelopeSimpleBold size="0.75rem" />
                      </ThemeIcon>
                      <Anchor href={`mailto:${SUPPORT_EMAIL}`} size="sm">
                        {SUPPORT_EMAIL}
                      </Anchor>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon
                        variant="light"
                        color="gray"
                        size="sm"
                        radius="xl"
                      >
                        <PiClockBold size="0.75rem" />
                      </ThemeIcon>
                      <Text size="xs" c="dimmed">
                        Replies within one working day
                      </Text>
                    </Group>
                  </Stack>
                </Card>

                {/* Got feedback? — opens the real FeedbackModal */}
                <Card p="lg">
                  <Stack gap="sm">
                    <Title order={4} fw="bold">
                      Got feedback?
                    </Title>
                    <Text size="sm" c="dimmed">
                      Bugs, ideas, or just how it's going — two minutes, no
                      ticket queue.
                    </Text>
                    <FeedbackModal
                      trigger={(open) => (
                        <Button fluid variant="ghost" onClick={open}>
                          Send feedback
                        </Button>
                      )}
                    />
                  </Stack>
                </Card>

                {/* What's new — static changelog */}
                <Card p="lg">
                  <Stack gap="sm">
                    <Group gap="xs">
                      <PiSparkleBold />
                      <Title order={4} fw="bold">
                        What's new
                      </Title>
                    </Group>
                    <Stack gap="sm">
                      {WHATS_NEW.map((item) => (
                        <Group
                          key={item.title}
                          gap="sm"
                          wrap="nowrap"
                          align="flex-start"
                        >
                          <Box
                            w={10}
                            h={10}
                            mt={6}
                            bdrs="xl"
                            bg={`${item.color}.5`}
                            style={{ flexShrink: 0 }}
                          />
                          <Stack gap={0}>
                            <Text size="sm" fw={600}>
                              {item.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {item.date}
                            </Text>
                          </Stack>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>
      </ScrollArea>

      {/* Lightbox — GIF loads here, on open only */}
      <Modal
        opened={lightbox !== null}
        onClose={() => setLightbox(null)}
        size="xl"
        radius="lg"
        centered
        title={lightbox?.title}
      >
        {lightbox && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              {lightbox.blurb}
            </Text>
            <Box
              bdrs="md"
              bd="2px solid var(--border-color)"
              style={{
                overflow: "hidden",
              }}
            >
              <Image
                src={
                  isMobile && lightbox.gifMobile
                    ? lightbox.gifMobile
                    : lightbox.gif
                }
                alt={lightbox.title}
                w="100%"
                h="auto"
                display="block"
              />
            </Box>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

/** A soft placeholder that stands in for a GIF until the user opens it. */
const GifPlaceholder = ({
  accent,
  label,
  onOpen,
}: {
  accent: string;
  label: string;
  onOpen: () => void;
}) => (
  <Box
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onOpen();
    }}
    bdrs="md"
    component={Group}
    justify="center"
    gap="sm"
    bg={`${accent}.0`}
    bd="2px dashed var(--border-color)"
    style={{
      cursor: "pointer",
      aspectRatio: "16 / 9",
      alignItems: "center",
    }}
  >
    <ThemeIcon variant="light" color={accent} radius="xl" size="xl">
      <PiPlayCircleBold />
    </ThemeIcon>
    <Badge variant="light" color={accent} size="sm">
      GIF · {label}
    </Badge>
  </Box>
);

const QuickStartCard = ({
  quickStart,
  onOpen,
}: {
  quickStart: {
    id: string;
    title: string;
    blurb: string;
    steps: number;
    mins: number;
    gif: string;
    accent: string;
  };
  onOpen: () => void;
}) => (
  <Card p="md" h="100%">
    <Stack gap="sm" h="100%">
      <GifPlaceholder
        accent={quickStart.accent}
        label={`${quickStart.id}.gif`}
        onOpen={onOpen}
      />
      <Stack gap={2} flex={1}>
        <Text fw={700} size="sm">
          {quickStart.title}
        </Text>
        <Text size="xs" c="dimmed">
          {quickStart.blurb}
        </Text>
      </Stack>
    </Stack>
  </Card>
);
