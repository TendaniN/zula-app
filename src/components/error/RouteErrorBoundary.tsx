import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { PiWarningBold, PiArrowLeftBold } from "react-icons/pi";
import { useNavigate, useLocation, type Location } from "react-router-dom";

interface InnerProps {
  children: ReactNode;
  navigate: (to: string) => void;
  location: Location;
}

interface InnerState {
  hasError: boolean;
  errorKey: string | null;
}

/**
 * Route-level error boundary.
 *
 * It resets on navigation: keying off location.key, a successful move to a new
 * route clears the error so the user isn't stuck on the fallback.
 *
 * Class components can't use hooks, and error boundaries MUST be classes
 * (getDerivedStateFromError is class-only) — so the inner class does the
 * catching and an outer function wrapper injects navigate + location.
 */
class RouteErrorBoundaryInner extends Component<InnerProps, InnerState> {
  state: InnerState = { hasError: false, errorKey: null };

  static getDerivedStateFromError(): Partial<InnerState> {
    return { hasError: true };
  }

  componentDidUpdate(prev: InnerProps) {
    // If the route changed since the error, clear it — the user navigated away
    // (via the button or the still-visible sidebar) and should see the new page.
    if (this.state.hasError && prev.location.key !== this.props.location.key) {
      this.setState({ hasError: false, errorKey: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ errorKey: this.props.location.key });
    void (async () => {
      try {
        const Sentry = await import("@sentry/react");
        Sentry.captureException(error, {
          contexts: { react: { componentStack: info.componentStack } },
          tags: { boundary: "route", route: this.props.location.pathname },
        });
      } catch {
        console.error("Uncaught page error:", error, info.componentStack);
      }
    })();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Center mih="60vh" p="lg">
        <Stack align="center" gap="md" maw={420} ta="center">
          <PiWarningBold size="2rem" color="var(--mantine-color-peach-6)" />
          <Title order={3} fw="bold">
            This page hit a snag
          </Title>
          <Text c="dimmed" size="sm">
            Something on this page didn't load right — the rest of Zula is fine.
            Head back to your trips and try again.
          </Text>
          <Group>
            <Button
              variant="ghost"
              leftSection={<PiArrowLeftBold />}
              onClick={() => this.props.navigate("/trips")}
            >
              Back to my trips
            </Button>
            <Button
              onClick={() => this.props.navigate(this.props.location.pathname)}
            >
              Try again
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }
}

/** Function wrapper: injects router hooks the class can't use itself. */
export const RouteErrorBoundary = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <RouteErrorBoundaryInner navigate={navigate} location={location}>
      {children}
    </RouteErrorBoundaryInner>
  );
};
