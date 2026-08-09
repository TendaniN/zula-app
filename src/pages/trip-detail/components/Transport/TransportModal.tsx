import { type ReactNode } from "react";

import {
  Divider,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuInfo, LuPencil, LuPlus, LuX } from "react-icons/lu";
import { Constants } from "@/types/database.types";

import { Button, IconButton } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useTransportStore } from "@/stores/transportStore";
import { TransportSchema, type TransportFormValues } from "../../schema";
import type { Transport, Location } from "@/types/models";
import { translateDate, formatDate } from "@/utils/date";
import { useLocationStore } from "@/stores/locationStore";

/**
 * transports.start_date/end_date are timestamptz — a full instant, not just
 * a calendar date — so toISOString() is the correct serialization here
 * (unlike the date-only columns elsewhere in the app, this isn't a timezone
 * bug: a timestamptz's UTC representation IS the value).
 */

const TYPE_OPTIONS = Constants.public.Enums.transport_type.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

interface TransportModalProps {
  tripId: string;
  /** Pass a transport to edit it; omit for create mode. */
  transport?: Transport;
  /** Trip's locations, for the optional start/end stop pickers. */
  locations?: Location[];
  trigger?: (open: () => void) => ReactNode;
  opened?: boolean;
  onClose?: () => void;
}

export const TransportModal = ({
  tripId,
  transport,
  trigger,
  opened: openedProp,
  onClose,
}: TransportModalProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const { createTransport, updateTransport } = useTransportStore();
  const locations = useLocationStore((s) => s.locations);

  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const isEdit = Boolean(transport);

  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: l.country ? `${l.city}, ${l.country}` : l.city,
  }));

  const form = useForm({
    defaultValues: {
      name: transport?.name ?? "",
      type: transport?.type ?? "flight",
      cost: transport?.cost ?? 0,
      duration_minutes: transport?.duration_minutes ?? null,
      start_date: transport?.start_date ?? null,
      end_date: transport?.end_date ?? null,
      start_location_id: transport?.start_location_id ?? null,
      end_location_id: transport?.end_location_id ?? null,
    } as TransportFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = TransportSchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof TransportFormValues, (m) => ({
              ...m,
              errors: [issue.message],
              errorMap: { ...m.errorMap, onSubmit: issue.message },
            }));
          }
        }

        return;
      }

      if (isEdit && transport) {
        await updateTransport(transport.id, result.data);
      } else {
        await createTransport(tripId, result.data);
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
      >
        {/* Banner header */}
        <Group
          justify="space-between"
          px="lg"
          py="md"
          style={{
            borderBottom: "2px solid var(--border-color)",
          }}
        >
          <Title order={3} fw="bold" c="var(--border-color)">
            {isEdit ? "Edit transport" : "Add transport"}
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
            <Group grow>
              <form.Field name="name">
                {(field) => (
                  <TextInput
                    required
                    label="Name"
                    placeholder="e.g. CPT → Rome (FCO)"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                    data-autofocus
                  />
                )}
              </form.Field>

              <form.Field name="type">
                {(field) => (
                  <Select
                    required
                    label="Type"
                    data={TYPE_OPTIONS}
                    value={field.state.value}
                    onChange={(v) =>
                      field.handleChange(
                        (v as TransportFormValues["type"]) ?? "flight",
                      )
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                    allowDeselect={false}
                  />
                )}
              </form.Field>
            </Group>

            <Group grow>
              <form.Field name="start_date">
                {(field) => (
                  <DateTimePicker
                    label="Departs · optional"
                    placeholder="Pick a date & time"
                    clearable
                    value={translateDate(field.state.value, "", true)}
                    onChange={(value) =>
                      field.handleChange(formatDate(value, "", true))
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>

              <form.Field name="end_date">
                {(field) => (
                  <DateTimePicker
                    label="Arrives · optional"
                    placeholder="Pick a date & time"
                    clearable
                    value={translateDate(field.state.value, "", true)}
                    onChange={(value) =>
                      field.handleChange(formatDate(value, "", true))
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

            {locationOptions.length > 0 && (
              <Group grow>
                <form.Field name="start_location_id">
                  {(field) => (
                    <Select
                      label="From · optional"
                      placeholder="Not a trip stop"
                      data={locationOptions}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v ?? null)}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors[0]}
                      clearable
                    />
                  )}
                </form.Field>

                <form.Field name="end_location_id">
                  {(field) => (
                    <Select
                      label="To · optional"
                      placeholder="Not a trip stop"
                      data={locationOptions}
                      value={field.state.value}
                      onChange={(v) => field.handleChange(v ?? null)}
                      onBlur={field.handleBlur}
                      error={field.state.meta.errors[0]}
                      clearable
                    />
                  )}
                </form.Field>
              </Group>
            )}

            <Divider variant="dashed" color="var(--border-color)" size="sm" />

            <Group gap="xs" wrap="nowrap" align="flex-start">
              <ThemeIcon
                variant="transparent"
                color="mint"
                radius="xl"
                size="sm"
                mt={2}
              >
                <LuInfo size="0.75rem" />
              </ThemeIcon>
              <Text size="xs" c="var(--muted)">
                Link the from/to stops to your trip's locations so this leg
                shows up in the right place in your itinerary.
              </Text>
            </Group>

            <Group grow gap="md">
              <Button variant="ghost" onClick={handleClose} type="button">
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Save changes" : "Add transport"}
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
          variant="secondary"
          leftSection={isEdit ? <LuPencil /> : <LuPlus />}
        >
          {isEdit ? "Edit transport" : "Add transport"}
        </Button>
      )}
    </>
  );
};
