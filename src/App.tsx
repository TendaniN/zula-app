import { useEffect } from "react";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { initAuth } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { theme } from "@/theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import Pages from "./pages";
import { BrowserRouter } from "react-router-dom";

function App() {
  useEffect(() => {
    initAuth();
  }, []);
  const colorScheme = useUiStore((s) => s.colorScheme);

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <DatesProvider settings={{ firstDayOfWeek: 1 }}>
        <Notifications />
        <BrowserRouter basename="zula">
          <Pages />
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  );
}

export default App;
