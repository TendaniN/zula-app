import { type ReactNode } from "react";

import {
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { LuInfo, LuPencil, LuPlus } from "react-icons/lu";

import { Button, Modal } from "@/components/ui";
import { useTodoStore } from "@/stores/todoStore";
import { TodoSchema, type TodoFormValues } from "../../schema";
import type { Todo } from "@/types/models";
import { formatDate, translateDate } from "@/utils/date";

interface TodoModalProps {
  tripId: string;
  /** Pass a todo to edit it; omit for create mode. */
  todo?: Todo;
  trigger?: (open: () => void) => ReactNode;
  opened?: boolean;
  onClose?: () => void;
}

export const TodoModal = ({
  tripId,
  todo,
  trigger,
  opened: openedProp,
  onClose,
}: TodoModalProps) => {
  const { createTodo, updateTodo } = useTodoStore();

  const [uncontrolledOpened, { open, close: closeUncontrolled }] =
    useDisclosure(false);

  const isControlled = openedProp !== undefined;
  const opened = isControlled ? openedProp : uncontrolledOpened;
  const close = isControlled ? (onClose ?? (() => {})) : closeUncontrolled;

  const isEdit = Boolean(todo);

  const form = useForm({
    defaultValues: {
      title: todo?.title ?? "",
      description: todo?.description ?? "",
      due_date: todo?.due_date ?? null,
    } as TodoFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = TodoSchema.safeParse(value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof TodoFormValues, (m) => ({
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
        description: result.data.description || null,
      };

      if (isEdit && todo) {
        await updateTodo(todo.id, payload);
      } else {
        await createTodo(tripId, payload);
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
        size="lg"
        title={isEdit ? "Edit to-do" : "Add to-do"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack gap="md" p="lg">
            <form.Field name="title">
              {(field) => (
                <TextInput
                  required
                  label="Title"
                  placeholder="e.g. Renew passport"
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
                  placeholder="Any extra detail worth noting..."
                  autosize
                  minRows={2}
                  maxRows={5}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>

            <form.Field name="due_date">
              {(field) => (
                <DatePickerInput
                  label="Due date · optional"
                  placeholder="Pick a date"
                  clearable
                  value={translateDate(field.state.value)}
                  onChange={(value) => field.handleChange(formatDate(value))}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>

            <Divider variant="dashed" color="var(--border-color)" size="sm" />

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
              <Text size="xs" c="var(--muted)">
                New to-dos start unchecked — tick them off from the list once
                they're done.
              </Text>
            </Group>

            <Group grow gap="md">
              <Button variant="ghost" onClick={handleClose} type="button">
                Cancel
              </Button>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" loading={isSubmitting}>
                    {isEdit ? "Save changes" : "Add to-do"}
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
          variant="tertiary"
          onClick={open}
          leftSection={isEdit ? <LuPencil /> : <LuPlus />}
        >
          {isEdit ? "Edit to-do" : "Add a to-do"}
        </Button>
      )}
    </>
  );
};
