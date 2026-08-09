import { Button, IconButton } from "@/components/ui";
import type { Todo } from "@/types/models";
import { formatDate } from "@/utils/date";
import {
  Badge,
  Card,
  Checkbox,
  Divider,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaPencil, FaRegTrashCan, FaTrash } from "react-icons/fa6";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { CanEditTrip } from "@/components/auth";
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
      <Group>
        <Divider
          size="lg"
          orientation="vertical"
          bdrs="md"
          color={`${TYPE_COLOR[getTodoType()]}.3`}
        />
        <Checkbox.Indicator
          style={{ cursor: "pointer" }}
          variant="filled"
          size="md"
          iconColor="var(--border-color)"
          bd="2px solid var(--border-color)"
          onClick={() => toggleCheckbox()}
          checked={is_complete}
        />
        <Group flex={1} justify="space-between">
          <Stack gap={4}>
            <Group>
              <Text
                fw="bold"
                size="sm"
                td={is_complete ? "line-through" : ""}
                c={is_complete ? "dimmed" : "var(--text-color)"}
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
                >
                  {TYPE_LABEL[getTodoType()]}
                </Badge>
              )}
            </Group>
            {!is_complete && description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {dueDate}
            </Text>
          </Stack>
          <CanEditTrip>
            <Menu position="bottom-end" withinPortal shadow="md">
              <Menu.Target>
                <IconButton
                  icon={<PiDotsThreeOutlineFill />}
                  variant="ghost"
                  size="sm"
                  aria-label="Location options"
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
        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          centered
          size="sm"
          title={
            <Stack gap="xs">
              <ThemeIcon color="red" radius="md">
                <FaTrash />
              </ThemeIcon>
              <Title order={4} lh={1} fw="bold">
                Delete this to-do?
              </Title>
            </Stack>
          }
        >
          <Stack gap="lg">
            <Text size="sm" c="dimmed">
              {`Delete "${title}"? This can't be undone.`}
            </Text>
            <Group grow>
              <Button fluid variant="ghost" onClick={closeDelete}>
                Cancel
              </Button>
              <Button fluid variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Group>
    </Card>
  );
};
