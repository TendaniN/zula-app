import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { PiWarningBold } from "react-icons/pi";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level error boundary. Catches render/lifecycle errors anywhere below it
 * and shows a friendly fallback instead of a white screen. Reports to Sentry
 * *if* it's present, but doesn't depend on it — so the fallback UX works with
 * or without error logging wired up.
 *
 * Note: error boundaries only catch errors during rendering, in lifecycle
 * methods, and in constructors of the tree below them. They do NOT catch
 * errors in event handlers, async code, or the boundary itself — those still
 * need try/catch (and Sentry's global handlers pick up unhandled rejections).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Flip to the fallback on the next render.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Report to Sentry only if it's been initialised — keeps this boundary
    // usable before Sentry is added, and in dev where Sentry is disabled.
    void (async () => {
      try {
        const Sentry = await import("@sentry/react");
        Sentry.captureException(error, {
          contexts: { react: { componentStack: info.componentStack } },
        });
      } catch {
        // Sentry not installed / not initialised — log locally instead.
        console.error("Uncaught render error:", error, info.componentStack);
      }
    })();
  }

  handleReload = () => {
    // Full reload is the safest recovery — the component tree is in an
    // unknown state, so re-rendering in place can just re-throw.
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <Center h="100dvh" p="lg">
        <Stack align="center" gap="md" maw={420} ta="center">
          <PiWarningBold size="2.5rem" color="var(--mantine-color-peach-6)" />
          <Title order={2} fw="bold">
            Something went wrong
          </Title>
          <Text c="dimmed" size="sm">
            An unexpected error crept in — we've been notified. Reloading
            usually sorts it. If it keeps happening, the Help page has a way to
            reach us.
          </Text>
          <Button onClick={this.handleReload}>Reload Zula</Button>
        </Stack>
      </Center>
    );
  }
}
