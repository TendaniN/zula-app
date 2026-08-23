import { Center, Image, useComputedColorScheme } from "@mantine/core";
import logo from "@/assets/logo.svg";
import logoReversed from "@/assets/logo_reversed.svg";
import "./styles.scss";

export const DefaultLoader = () => {
  // Swap the logo for contrast against the background, matching the resolved
  // (auto-aware) scheme rather than the raw user preference.
  const scheme = useComputedColorScheme("light");
  const src = scheme === "dark" ? logoReversed : logo;

  return (
    <Center h="calc(100dvh - 4px)" bg="var(--bg-color)">
      <Image
        src={src}
        alt="Loading Zula"
        w="6rem"
        h="6rem"
        className="app-loader__pin"
      />
    </Center>
  );
};
