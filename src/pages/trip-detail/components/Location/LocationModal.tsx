import { type ReactNode, useState } from "react";

import {
  Collapse,
  Divider,
  Group,
  InputLabel,
  NumberInput,
  Rating,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuBed, LuInfo, LuLink, LuPlus, LuPencil } from "react-icons/lu";

import { Button, Modal } from "@/components/ui";
import { ALL_CITIES_MAP } from "@/constants/city";
import { Constants } from "@/types/database.types";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useLocationStore } from "@/stores/locationStore";
import {
  LocationSchema,
  countryForCity,
  type LocationFormValues,
} from "../../schema";
import type { Location, Accommodation } from "@/types/models";
import dayjs from "dayjs";
import { formatDate, translateDate } from "@/utils/date";

/* ------------------------------------------------------------------ */
/* Select data                                                         */
/* ------------------------------------------------------------------ */

const CITY_OPTIONS = (ALL_CITIES_MAP as readonly string[]).map((c) => ({
  value: c,
  label: c,
}));

const ACCOMMODATION_TYPE_OPTIONS =
  Constants.public.Enums.accommodation_type.map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
  }));

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

interface LocationModalProps {
  tripId: string;
  /** Pass a location (+ optional accommodation) to edit; omit for create. */
  location?: Location;
  accommodation?: Accommodation | null;
  trigger?: (open: () => void) => ReactNode;
  opened?: boolean;
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const LocationModal = ({
  tripId,
  location,
  accommodation,
  trigger,
  opened: openedProp,
  onClose,
}: LocationModalProps) => {
  const currency = useCurrencyStore((s) => s.symbol);
  const { createLocation, updateLocation, saveAccommodation } =
    useLocationStore();

  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const isEdit = Boolean(location);

  // Whether the accommodation section is expanded.
  const [showAccommodation, setShowAccommodation] = useState(
    Boolean(accommodation),
  );

  const form = useForm({
    defaultValues: {
      city: location?.city ?? "",
      start_date: location?.start_date ?? null,
      end_date: location?.end_date ?? null,
      accommodation: accommodation
        ? {
            name: accommodation.name ?? "",
            type: accommodation.type ?? undefined,
            cost_per_night: accommodation.cost_per_night ?? undefined,
            rating: accommodation.rating ?? null,
            link: accommodation.link ?? "",
            room: accommodation.room ?? "",
          }
        : {
            name: "",
            type: undefined,
            cost_per_night: undefined,
            rating: null,
            link: "",
            room: "",
          },
    } as LocationFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = LocationSchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof LocationFormValues, (m) => ({
              ...m,
              errors: [issue.message],
              errorMap: { ...m.errorMap, onSubmit: issue.message },
            }));
          }
        }
        return;
      }

      const { accommodation: accData, ...locationFields } = result.data;

      // Country is derived from the city, not a form field.
      const locationData = {
        ...locationFields,
        country: countryForCity(locationFields.city),
      };

      let locationId = location?.id;

      if (isEdit && location) {
        await updateLocation(location.id, locationData);
      } else {
        const created = await createLocation(tripId, locationData);
        locationId = created?.id;
      }

      // Save accommodation if the section is open and has a name.
      if (locationId && showAccommodation && accData?.name) {
        await saveAccommodation({
          ...(accommodation?.id ? { id: accommodation.id } : {}),
          location_id: locationId,
          name: accData.name,
          type: accData.type as Accommodation["type"] | undefined,
          cost_per_night: accData.cost_per_night,
          rating: accData.rating,
          link: accData.link || null,
          room: accData.room || null,
        });
      }

      form.reset();
      close();
    },
  });

  const handleClose = () => {
    form.reset();
    setShowAccommodation(Boolean(accommodation));
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        close={handleClose}
        size="lg"
        title={isEdit ? "Edit Stay" : "Add Stay"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md" p="lg">
            <Group grow>
              <form.Field name="city">
                {(field) => (
                  <Select
                    label="City"
                    placeholder="Search for a city..."
                    data={CITY_OPTIONS}
                    searchable
                    nothingFoundMessage="No cities found"
                    value={field.state.value || null}
                    onChange={(v) =>
                      field.handleChange(
                        (v ?? "") as LocationFormValues["city"],
                      )
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>

              <form.Subscribe selector={(s) => s.values.city}>
                {(city) => {
                  const country = city ? countryForCity(city) : null;
                  return country ? (
                    <Stack gap="xs" my="auto">
                      <InputLabel>Country</InputLabel>
                      <Text c="dimmed" my="auto">
                        {country}
                      </Text>
                    </Stack>
                  ) : null;
                }}
              </form.Subscribe>
            </Group>

            {/* ── Dates ───────────────────────────────────────── */}
            <Group grow>
              <form.Field name="start_date">
                {(field) => (
                  <DatePickerInput
                    required
                    label="Start date"
                    placeholder="Pick a date"
                    clearable
                    minDate={dayjs().format("YYYY-MM-DD")}
                    value={translateDate(field.state.value)}
                    onChange={(value) => field.handleChange(formatDate(value))}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>

              <form.Field name="end_date">
                {(field) => (
                  <DatePickerInput
                    required
                    label="End date"
                    placeholder="Pick a date"
                    clearable
                    minDate={dayjs().format("YYYY-MM-DD")}
                    value={formatDate(field.state.value)}
                    onChange={(d) =>
                      field.handleChange(formatDate(d as Date | null))
                    }
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
            </Group>

            {/* ── Accommodation toggle ────────────────────────── */}
            <Divider variant="dashed" color="var(--border-color)" size="sm" />

            <Group justify="space-between">
              <Group gap="xs">
                <LuBed />
                <Text fw={600} size="sm">
                  Accommodation
                </Text>
                <Text size="xs" c="dimmed">
                  · optional
                </Text>
              </Group>
              <Switch
                size="md"
                checked={showAccommodation}
                onChange={(e) => setShowAccommodation(e.currentTarget.checked)}
                aria-label="Toggle accommodation"
              />
            </Group>

            <Collapse expanded={showAccommodation}>
              <Stack
                gap="md"
                p="md"
                style={{
                  border: "2px solid var(--border-color)",
                  borderRadius: "var(--mantine-radius-md)",
                }}
              >
                <Group grow>
                  <form.Field name="accommodation.name">
                    {(field) => (
                      <TextInput
                        label="Name"
                        placeholder="e.g. Hotel Colosseo"
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>

                  <form.Field name="accommodation.type">
                    {(field) => (
                      <Select
                        label="Type"
                        placeholder="Select type"
                        data={ACCOMMODATION_TYPE_OPTIONS}
                        value={field.state.value ?? null}
                        onChange={(v) => field.handleChange(v ?? undefined)}
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                        clearable
                      />
                    )}
                  </form.Field>
                </Group>

                <Group grow>
                  <form.Field name="accommodation.cost_per_night">
                    {(field) => (
                      <NumberInput
                        label="Cost per night"
                        prefix={`${currency} `}
                        thousandSeparator
                        min={0}
                        placeholder="120"
                        value={field.state.value ?? ""}
                        onChange={(v) =>
                          field.handleChange(v === "" ? undefined : Number(v))
                        }
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>

                  <form.Field name="accommodation.room">
                    {(field) => (
                      <TextInput
                        label="Room · optional"
                        placeholder="e.g. Double, city view"
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>
                </Group>

                <Group grow>
                  <form.Field name="accommodation.link">
                    {(field) => (
                      <TextInput
                        label="Link · optional"
                        placeholder="https://..."
                        leftSection={<LuLink size={14} />}
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>

                  <form.Field name="accommodation.rating">
                    {(field) => (
                      <Stack gap={4}>
                        <Text size="sm" fw={500} c="dimmed">
                          Rating · optional
                        </Text>
                        <Rating
                          fractions={2}
                          value={field.state.value ?? 0}
                          onChange={(v) => field.handleChange(v || null)}
                          size="md"
                        />
                      </Stack>
                    )}
                  </form.Field>
                </Group>
              </Stack>
            </Collapse>

            {/* ── Footer ──────────────────────────────────────── */}
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
              <Text size="xs" c="var(--muted)" my="auto">
                {isEdit
                  ? "Updating dates here will adjust the trip's overall dates automatically."
                  : "Trip dates and country flags derive from your locations - they'll update once you save."}
              </Text>
            </Group>

            <Group grow gap="md">
              <Button variant="ghost" onClick={handleClose} type="button">
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Save" : "Add stay"}
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
          {isEdit ? "Edit a stay" : "Add a stay"}
        </Button>
      )}
    </>
  );
};
