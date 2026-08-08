import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import {
  BackgroundImage,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import wallpaperLightImg from "@/assets/wallpaper_light.png";
import wallpaperDarkImg from "@/assets/wallpaper_dark.png";

export default function LogoutPage() {
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    handleLogout();
  }, []);

  const { colorScheme } = useMantineColorScheme();
  return (
    <BackgroundImage
      src={colorScheme === "dark" ? wallpaperDarkImg : wallpaperLightImg}
      flex={1}
      style={{
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Group h="calc(100dvh - 4px)" gap={0} justify="center">
        <Center>
          <Card shadow="lg" p="xl">
            <Stack justify="center">
              <Loader color="mint" mx="auto" size="xl" />
              <Title order={3} fw="bold" ta="center">
                Logging you out...
              </Title>
              <Text c="dimmed" size="sm" ta="center">
                You will be redirected to the login page. Come back anytime.
              </Text>
            </Stack>
          </Card>
        </Center>
      </Group>
    </BackgroundImage>
  );
}
