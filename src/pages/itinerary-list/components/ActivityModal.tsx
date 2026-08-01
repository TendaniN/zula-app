import { type ReactNode } from "react";

import {
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuInfo, LuLink, LuPencil, LuPlus, LuX } from "react-icons/lu";

import { Button, IconButton } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useActivityStore } from "@/stores/activityStore";
import { ActivitySchema, type ActivityFormValues } from "../schema";
import type { Activity } from "@/types/models";
import { formatDate, translateDate } from "@/utils/date";

interface ActivityModalProps {
  locationId: string;
  /** Pass an activity to edit it; omit for create mode. */
  activity?: Activity;
  /** Custom trigger (e.g. a Menu.Item or a card). Receives `open`. */
  trigger?: (open: () => void) => ReactNode;
  /** Controlled visibility — pass when a parent owns state (e.g. a Menu.Item
   *  trigger, whose dropdown unmounts on click and would take an internally
   *  opened Modal down with it). No trigger is rendered in this mode. */
  opened?: boolean;
  onClose?: () => void;
  /**
   * Pre-fill the date field when creating from a specific day slot (e.g. an
   * empty "Day 3" row). Ignored when editing an existing activity.
   */
  defaultActivityDate?: string | null;
}

export const ActivityModal = ({
  locationId,
  activity,
  trigger,
  opened: openedProp,
  onClose,
  defaultActivityDate,
}: ActivityModalProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const { createActivity, updateActivity } = useActivityStore();

  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const isEdit = Boolean(activity);

  const form = useForm({
    defaultValues: {
      name: activity?.name ?? "",
      cost: activity?.cost ?? 0,
      activity_date: activity?.activity_date ?? defaultActivityDate ?? null,
      activity_time: activity?.activity_time ?? null,
      duration_minutes: activity?.duration_minutes ?? null,
      link: activity?.link ?? "",
    } as ActivityFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = ActivitySchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof ActivityFormValues, (m) => ({
              ...m,
              errors: [issue.message],
              errorMap: { ...m.errorMap, onSubmit: issue.message },
            }));
          }
        }
        return;
      }

      const payload = {
        ...result.data,
        link: result.data.link || null,
      };

      if (isEdit && activity) {
        await updateActivity(activity.id, payload);
      } else {
        await createActivity(locationId, payload);
      }

      form.reset();
      close();
    },
  });

  const handleClose = () => {
    form.reset();
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        size="lg"
        radius="lg"
        padding={0}
        title={null}
        withCloseButton={false}
        overlayProps={{ blur: 2 }}
        withinPortal={true}
      >
        {/* Banner header */}
        <Group
          justify="space-between"
          px="lg"
          py="md"
          style={{
            background: "var(--mantine-color-lavender-1)",
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <Title order={3} fw="bold" c="var(--text-color)">
            {isEdit ? "Edit activity" : "Add activity"}
          </Title>
          <IconButton
            icon={<LuX />}
            variant="ghost"
            aria-label="Close"
            onClick={handleClose}
          />
        </Group>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md" p="lg">
            <form.Field name="name">
              {(field) => (
                <TextInput
                  required
                  label="Activity name"
                  placeholder="e.g. Colosseum guided tour"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                  data-autofocus
                />
              )}
            </form.Field>

            <Group grow>
              <form.Field name="activity_date">
                {(field) => (
                  <DatePickerInput
                    label="Date · optional"
                    placeholder="Pick a date"
                    clearable
                    value={translateDate(field.state.value)}
                    onChange={(value) => field.handleChange(formatDate(value))}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>

              <form.Field name="activity_time">
                {(field) => (
                  <TimeInput
                    label="Time · optional"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.currentTarget.value || null)
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </Group>

            <Group grow>
              <form.Field name="cost">
                {(field) => (
                  <NumberInput
                    label="Cost"
                    prefix={`${currency} `}
                    thousandSeparator
                    min={0}
                    placeholder="0"
                    value={field.state.value}
                    onChange={(v) => field.handleChange(Number(v) || 0)}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>

              <form.Field name="duration_minutes">
                {(field) => (
                  <NumberInput
                    label="Duration (minutes) · optional"
                    min={0}
                    step={15}
                    placeholder="120"
                    value={field.state.value ?? ""}
                    onChange={(v) =>
                      field.handleChange(v === "" ? null : Number(v))
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </Group>

            <form.Field name="link">
              {(field) => (
                <TextInput
                  label="Link · optional"
                  placeholder="https://..."
                  leftSection={<LuLink />}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>

            <Divider variant="dashed" color="var(--border-color)" size="sm" />

            <Group gap="xs" wrap="nowrap" align="flex-start">
              <ThemeIcon
                variant="transparent"
                color="peach"
                radius="xl"
                size="sm"
                mt={2}
              >
                <LuInfo size="0.75rem" />
              </ThemeIcon>
              <Text size="xs" c="var(--muted)" my="auto">
                Date and time are optional - log the activity now and fill in
                the schedule later if it isn't set yet.
              </Text>
            </Group>

            <Group grow gap="md">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Save" : "Add activity"}
                  </Button>
                )}
              </form.Subscribe>
            </Group>
          </Stack>
        </form>
      </Modal>

      {isControlled ? null : trigger ? (
        trigger(open)
      ) : (
        <Button
          onClick={open}
          size="sm"
          leftSection={isEdit ? <LuPencil /> : <LuPlus />}
        >
          {isEdit ? "Edit activity" : "Add activity"}
        </Button>
      )}
    </>
  );
};
