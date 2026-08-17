import { type ReactNode } from "react";

import {
  Divider,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuInfo, LuLink, LuPencil, LuPlus } from "react-icons/lu";

import { Button, Modal } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useActivityStore } from "@/stores/activityStore";
import { ActivitySchema, type ActivityFormValues } from "../schema";
import type { Activity, ActivityType } from "@/types/models";
import { formatDate, translateDate } from "@/utils/date";

const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  breakfast: "Breakfast",
  brunch: "Brunch",
  lunch: "Lunch",
  dinner: "Dinner",
  cafe: "Café / coffee",
  drinks: "Drinks / nightlife",
  tour: "Tour",
  sightseeing: "Sightseeing",
  museum: "Museum / gallery",
  attraction: "Attraction / theme park",
  hike: "Walk or hike",
  outdoor: "Outdoor / adventure",
  beach: "Beach / pool",
  shopping: "Shopping",
  entertainment: "Show / entertainment",
  wellness: "Spa / wellness",
  other: "Other",
};

const ACTIVITY_TYPE_DATA = [
  {
    group: "Meals & drinks",
    items: ["breakfast", "brunch", "lunch", "dinner", "cafe", "drinks"],
  },
  {
    group: "Explore & culture",
    items: [
      "tour",
      "sightseeing",
      "museum",
      "attraction",
      "shopping",
      "entertainment",
    ],
  },
  { group: "Outdoors & active", items: ["hike", "outdoor", "beach"] },
  { group: "Relax & other", items: ["wellness", "other"] },
].map((g) => ({
  group: g.group,
  items: g.items.map((k) => ({
    value: k,
    label: ACTIVITY_TYPE_LABEL[k as ActivityType],
  })),
}));

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
      type: activity?.type ?? "other",
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
        close={handleClose}
        title={isEdit ? "Edit activity" : "Add activity"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md" p="lg">
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <form.Field name="type">
                {(field) => (
                  <Select
                    required
                    label="Type"
                    data={ACTIVITY_TYPE_DATA}
                    value={field.state.value}
                    onChange={(v) =>
                      field.handleChange((v as ActivityType) ?? "other")
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                    searchable
                    allowDeselect={false}
                    checkIconPosition="right"
                    comboboxProps={{ withinPortal: true }}
                  />
                )}
              </form.Field>
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
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, xs: 2 }}>
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
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              <form.Field name="cost">
                {(field) => (
                  <NumberInput
                    required
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
            </SimpleGrid>

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
