import { type ReactNode } from "react";

import {
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuInfo, LuPlus, LuPencil } from "react-icons/lu";
import { STATUS_SELECT_OPTIONS } from "@/constants/status";
import { Button, Modal } from "@/components/ui";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useTripStore } from "@/stores/tripStore";
import { TripSchema, type TripFormValues } from "../schema";
import type { Trip, TripStatus } from "@/types/models";
import { useNavigate } from "react-router-dom";

interface TripModalProps {
  /** Pass a trip to edit it; omit for create mode. */
  trip?: Trip;
  /**
   * Custom trigger (e.g. a Menu.Item or a card). Receives `open`.
   * When omitted, a default Button is rendered.
   */
  trigger?: (open: () => void) => ReactNode;
  /**
   * Controlled visibility. Pass `opened`/`onClose` when a parent owns the
   * state (e.g. a trigger that unmounts, like a Menu.Item). In this mode no
   * internal trigger is rendered.
   */
  opened?: boolean;
  onClose?: () => void;
}

export const TripModal = ({
  trip,
  trigger,
  opened: openedProp,
  onClose,
}: TripModalProps) => {
  const navigate = useNavigate();
  const currency = useCurrencyStore((s) => s.symbol);
  const { createTrip, updateTrip } = useTripStore();

  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const isEdit = Boolean(trip);

  const form = useForm({
    defaultValues: {
      name: trip?.name ?? "",
      description: trip?.description ?? "",
      buffer_cost: trip?.buffer_cost ?? 0,
      status: trip?.status ?? "planning",
    } as TripFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = TripSchema.safeParse(value);
      if (result.success) {
        const parsed = TripSchema.parse(value);

        if (isEdit && trip) {
          await updateTrip(trip.id, parsed);
        } else {
          const data = await createTrip(parsed);

          if (data) {
            navigate(`/trips/${data.id}?tab=Stays & itinerary`);
          }
        }
        form.reset();
        close();
      } else {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof TripFormValues, (m) => ({
              ...m,
              errors: [issue.message],
              errorMap: { ...m.errorMap, onSubmit: issue.message },
            }));
          }
        }
        return;
      }
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
        size="lg"
        title={isEdit ? "Edit trip" : "New trip"}
      >
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
                  label="Trip name"
                  placeholder="e.g. Italy 2032"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                  data-autofocus
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Textarea
                  label="Description · optional"
                  placeholder="A few words about this trip..."
                  autosize
                  minRows={3}
                  maxRows={6}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>

            <form.Field name="buffer_cost">
              {(field) => (
                <NumberInput
                  label="Budget buffer · optional"
                  prefix={`${currency} `}
                  thousandSeparator
                  min={0}
                  placeholder="200"
                  value={field.state.value}
                  onChange={(v) => field.handleChange(Number(v) || 0)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                  description="A safety margin added on top of planned costs when working out your savings target."
                />
              )}
            </form.Field>

            {isEdit && (
              <form.Field name="status">
                {(field) => (
                  <Select
                    label="Status"
                    data={STATUS_SELECT_OPTIONS}
                    value={field.state.value}
                    onChange={(v) =>
                      field.handleChange((v as TripStatus) ?? "planning")
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                    allowDeselect={false}
                    checkIconPosition="right"
                    comboboxProps={{ withinPortal: true }}
                  />
                )}
              </form.Field>
            )}

            <Divider variant="dashed" color="var(--border-color)" size="sm" />

            {/* Owner / dates helper note */}
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <ThemeIcon
                variant="transparent"
                color="lavender"
                radius="xl"
                size="sm"
                mt={2}
              >
                <LuInfo size="0.75rem" />
              </ThemeIcon>
              <Text size="xs" c="var(--muted)" my="auto">
                {isEdit
                  ? "Set the status yourself - Active and Completed also advance automatically based on your trip dates."
                  : "You'll be the trip owner. Trip dates fill in automatically from your earliest and latest stays, and invites happen from the trip page once it's created."}
              </Text>
            </Group>

            <Group grow gap="md">
              <Button variant="ghost" onClick={handleClose} type="button">
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Save changes" : "Create trip"}
                  </Button>
                )}
              </form.Subscribe>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Trigger: skipped entirely in controlled mode */}
      {isControlled ? null : trigger ? (
        trigger(open)
      ) : (
        <Button onClick={open} leftSection={isEdit ? <LuPencil /> : <LuPlus />}>
          {isEdit ? "Edit trip" : "New trip"}
        </Button>
      )}
    </>
  );
};
