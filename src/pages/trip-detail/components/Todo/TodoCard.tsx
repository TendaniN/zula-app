import { IconButton, CanEditTrip, DeleteModal } from "@/components";
import type { Todo } from "@/types/models";
import { formatDate } from "@/utils/date";
import {
  Badge,
  Card,
  Checkbox,
  Divider,
  Flex,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaPencil, FaRegTrashCan } from "react-icons/fa6";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import dayjs from "dayjs";
import { TodoModal } from "./TodoModal";
import { useTodoStore } from "@/stores/todoStore";

type TodoType = "pending" | "done" | "near" | "overdue";

const TYPE_COLOR: Record<TodoType, string> = {
  pending: "lavender",
  done: "mint",
  near: "peach",
  overdue: "red",
};

const TYPE_LABEL: Record<TodoType, string> = {
  pending: "Pending",
  done: "Done",
  near: "Near",
  overdue: "Overdue",
};

interface TodoCardProps {
  tripId: string;
  todo: Todo;
}

export const TodoCard = ({ tripId, todo }: TodoCardProps) => {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const { title, description, due_date, is_complete, id } = todo;

  const { deleteTodo, toggleComplete } = useTodoStore();

  const dueDate = due_date
    ? `Due ${formatDate(due_date, "MMM D")}`
    : "Dates TBC";

  const confirmDelete = async () => {
    await deleteTodo(id);
    closeDelete();
  };

  const toggleCheckbox = async () => {
    await toggleComplete(id);
  };

  const getTodoType = (): TodoType => {
    if (is_complete) return "done";
    if (!due_date) return "pending";

    const today = dayjs().startOf("day");
    const due = dayjs(due_date).startOf("day");

    if (!due.isValid()) return "pending";

    if (due.isSame(today) || due.isBefore(today)) return "overdue";
    if (due.diff(today, "day") <= 7) return "near";

    return "pending";
  };

  return (
    <Card
      radius="lg"
      p="md"
      bg="var(--surface-color)"
      shadow="xl"
      style={{
        boxShadow: `0 4px 0 var(--bg-secondary)`,
      }}
    >
      <Group gap="sm">
        <Divider
          size="lg"
          orientation="vertical"
          bdrs="md"
          color={`${TYPE_COLOR[getTodoType()]}.3`}
        />
        <Group justify="space-between" flex={1} wrap="nowrap" gap="xs">
          <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Checkbox.Indicator
              style={{ cursor: "pointer", flexShrink: 0 }}
              variant="filled"
              size="md"
              iconColor="var(--border-color)"
              bd="2px solid var(--border-color)"
              onClick={() => toggleCheckbox()}
              checked={is_complete}
            />
            <Stack miw={0} flex={1} gap={2}>
              <Flex
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 0, sm: "xs" }}
                align={{ base: "flex-start", sm: "center" }}
                miw={0}
              >
                <Text
                  fw="bold"
                  size="sm"
                  td={is_complete ? "line-through" : ""}
                  c={is_complete ? "dimmed" : "var(--text-color)"}

                  miw={0}
                  flex={1}
                >
                  {title}
                </Text>
                {(getTodoType() === "near" || getTodoType() === "overdue") && (
                  <Badge
                    variant="filled"
                    color={`${TYPE_COLOR[getTodoType()]}.3`}
                    c="var(--border-color)"
                    tt="capitalize"
                    bd={`2px solid ${TYPE_COLOR[getTodoType()]}.5`}
                    style={{ flexShrink: 0 }}
                  >
                    {TYPE_LABEL[getTodoType()]}
                  </Badge>
                )}
              </Flex>

              {!is_complete && description && (
                <Text
                  size="xs"
                  c="dimmed"
                  display={{ base: "none", sm: "block" }}
                  truncate
                >
                  {description}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {dueDate}
              </Text>
            </Stack>
          </Group>

          <CanEditTrip>
            <Menu position="bottom-end" withinPortal shadow="md">
              <Menu.Target>
                <IconButton
                  icon={<PiDotsThreeOutlineFill />}
                  variant="ghost"
                  size="sm"
                  aria-label="Todo options" // was "Location options"
                  style={{ flexShrink: 0 }}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<FaPencil />} onClick={openEdit}>
                  Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<FaRegTrashCan />}
                  onClick={openDelete}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </CanEditTrip>
        </Group>
        <TodoModal
          todo={todo}
          tripId={tripId}
          opened={editOpened}
          onClose={closeEdit}
        />
        <DeleteModal
          opened={deleteOpened}
          close={closeDelete}
          confirm={confirmDelete}
          item="to-do"
          name={title}
        />
      </Group>
    </Card>
  );
};
