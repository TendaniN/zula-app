import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import {
  Chip,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useLocation, useParams } from "react-router-dom";
import { PiChatCircleTextBold } from "react-icons/pi";

import { useAuthStore } from "@/stores/authStore";
import { useFeedbackStore } from "@/stores/feedbackStore";
import { FeedbackSchema, type FeedbackFormValues } from "./schema";

const CATEGORY_OPTIONS = [
  { value: "bug", label: "Bug" },
  { value: "idea", label: "Idea" },
  { value: "confusion", label: "Confusion" },
  { value: "praise", label: "Praise" },
  { value: "other", label: "Other" },
];

const SENTIMENT_OPTIONS = [
  { value: "positive", label: "😊 Good" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "negative", label: "😞 Rough" },
];

interface FeedbackModalProps {
  trigger?: (open: () => void) => React.ReactNode;
  opened?: boolean;
  onClose?: () => void;
}

export const FeedbackModal = ({
  trigger,
  opened: openedProp,
  onClose,
}: FeedbackModalProps) => {
  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;
  const [submitted, setSubmitted] = useState(false);

  const profile = useAuthStore((s) => s.profile);
  const submitFeedback = useFeedbackStore((s) => s.submitFeedback);

  const location = useLocation();
  const { tripId } = useParams();

  const [anonymous, setAnonymous] = useState(false);

  const form = useForm({
    defaultValues: {
      category: "bug" as FeedbackFormValues["category"],
      message: "",
      sentiment: null,
      contact_email: "",
    } as FeedbackFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = FeedbackSchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof FeedbackFormValues, (m) => ({
              ...m,
              errors: [issue.message],
              errorMap: { ...m.errorMap, onSubmit: issue.message },
            }));
          }
        }

        return;
      }

      const data = {
        ...result.data,
        contact_email: anonymous ? undefined : result.data.contact_email,
      };
      const ok = await submitFeedback(data, {
        route: location.pathname + location.search,
        tripId: tripId ?? null,
      });

      if (ok) setSubmitted(true);
    },
  });

  const handleClose = () => {
    form.reset();
    setAnonymous(false);
    setSubmitted(false);
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        close={handleClose}
        title="Send feedback"
        description="Two minutes, no ticket queue."
        size="lg"
      >
        {submitted ? (
          <Stack gap="md" p="lg" align="center">
            <Text size="xl">🎉</Text>
            <Text fw={700}>Thank you — got it.</Text>
            <Text size="sm" c="dimmed" ta="center">
              Your feedback helps shape where Zula goes next.
            </Text>
            <Button onClick={handleClose}>Done</Button>
          </Stack>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Stack gap="lg" p="lg">
              <form.Field name="category">
                {(field) => (
                  <Stack gap={6}>
                    <Text size="sm" fw={600}>
                      What kind of feedback?
                    </Text>
                    <SegmentedControl
                      fullWidth
                      data={CATEGORY_OPTIONS}
                      value={field.state.value ?? "bug"}
                      onChange={(v) =>
                        field.handleChange(
                          (v || null) as FeedbackFormValues["category"],
                        )
                      }
                      styles={{
                        root: {
                          backgroundColor: "var(--bg-secondary)",
                          border: "2px solid var(--border-color)",
                        },
                      }}
                    />
                  </Stack>
                )}
              </form.Field>

              <form.Field name="message">
                {(field) => (
                  <Textarea
                    required
                    label="Tell us more"
                    placeholder="What happened, or what would help?"
                    autosize
                    minRows={3}
                    maxRows={8}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                    data-autofocus
                  />
                )}
              </form.Field>

              <form.Field name="sentiment">
                {(field) => (
                  <Stack gap={6}>
                    <Text size="sm" fw={600}>
                      How does Zula feel overall?{" "}
                      <Text size="xs" c="dimmed" component="span" fw={400}>
                        (optional)
                      </Text>
                    </Text>
                    <Chip.Group
                      value={field.state.value || null}
                      onChange={(v) =>
                        field.handleChange(
                          (v || null) as FeedbackFormValues["sentiment"],
                        )
                      }
                    >
                      <Group gap="xs">
                        {SENTIMENT_OPTIONS.map((opt) => (
                          <Chip
                            key={`sentiment-${opt.value}`}
                            icon={null}
                            value={opt.value}

                            styles={{
                              checkIcon: { display: "none" },
                              label: {
                                padding: "0.25rem 1rem",
                                border: "2px solid var(--border-color)",
                              },
                            }}
                          >
                            {opt.label}
                          </Chip>
                        ))}
                      </Group>
                    </Chip.Group>
                  </Stack>
                )}
              </form.Field>

              <Group
                justify="space-between"
                wrap="nowrap"
                gap="xs"
                p="xs"
                bdrs="md"
                bg="var(--bg-secondary)"
                bd="2px solid var(--border-color)"
              >
                <Text size="xs" c="dimmed">
                  {anonymous
                    ? "Submitting anonymously — we won’t be able to reply directly."
                    : `We'll include your email ${profile?.email ? ` (${profile.email})` : ""} so we can reply.`}
                </Text>
                <Button
                  variant={anonymous ? "primary" : "ghost"}
                  size="xs"
                  onClick={() => setAnonymous((a) => !a)}
                >
                  {anonymous ? "Include email" : "Go anonymous"}
                </Button>
              </Group>

              <Text size="xs" c="dimmed">
                We attach the page you're on and app version automatically —
                nothing else to fill in.
              </Text>

              <Group grow gap="md">
                <Button variant="ghost" onClick={handleClose} type="button">
                  Cancel
                </Button>
                <form.Subscribe selector={(s) => s.isSubmitting}>
                  {(isSubmitting) => (
                    <Button type="submit" loading={isSubmitting}>
                      Submit feedback
                    </Button>
                  )}
                </form.Subscribe>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

      {isControlled ? null : trigger ? (
        trigger(open)
      ) : (
        <button className="sidebar__nav--item" onClick={open}>
          <Group>
            <PiChatCircleTextBold />
            <Text fz="sm">Feedback</Text>
          </Group>
        </button>
      )}
    </>
  );
};
