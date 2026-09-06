import {
  BackgroundImage,
  Card,
  Container,
  Group,
  Image,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import wallpaperLightImg from "@/assets/wallpaper_light.png";
import wallpaperDarkImg from "@/assets/wallpaper_dark.png";
import logoImg from "@/assets/logo_reversed.svg";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  const { colorScheme } = useMantineColorScheme();
  return (
    <BackgroundImage
      src={colorScheme === "dark" ? wallpaperDarkImg : wallpaperLightImg}
      flex={1}
      bgp="center"
      bgsz="cover"
      bgr="no-repeat"
    >
      <Group h="calc(100dvh - 4px)" gap={0}>
        <Stack p="lg" h="100%" w={{ base: "30%", sm: "50%", xl: "60%" }}>
          <Group>
            <Image w={{ base: 32, sm: 40 }} src={logoImg} alt="Zula" />
            <Title order={2} fw="bold">
              zula
            </Title>
          </Group>
          <Card
            mt="auto"
            w="fit-content"
            p="lg"
            style={{
              backgroundColor:
                "color-mix(in srgb, light-dark(var(--mantine-color-white), var(--mantine-color-black)) 65%, transparent)",
            }}
          >
            <Stack gap="xs">
              <Title order={3} fw="bold">
                Packed bags.
                <br />
                Packed itinerary.
              </Title>
              <Text c="dimmed">Plan every stay and activity together.</Text>
            </Stack>
          </Card>
        </Stack>
        <Container
          w={{ base: "70%", sm: "50%", xl: "40%" }}
          p="xl"
          h="100%"
          bg="var(--bg-color)"
          style={{
            borderLeft: "2px solid var(--border-color)",
          }}
          component="main"
        >
          <Outlet />
        </Container>
      </Group>
    </BackgroundImage>
  );
}
