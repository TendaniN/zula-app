import {
  Center,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import noTodosImg from "@/assets/icons/empty-todos.svg";
import { CanEditTrip } from "@/components/auth";
import { useEffect, useState } from "react";
import { useTodoStore } from "@/stores/todoStore";
import { TodoModal } from "./TodoModal";
import { TodoCard } from "./TodoCard";
import dayjs from "dayjs";

interface TodoPanelProps {
  tripId: string;
}

export const TodoPanel = ({ tripId }: TodoPanelProps) => {
  const { todos, fetchByTrip } = useTodoStore();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const load = async (id: string) => {
      await fetchByTrip(id);
      setInitialized(true);
    };

    load(tripId);
  }, [tripId]);

  if (!initialized) {
    return (
      <Stack flex={1}>
        <Center
          display="flex"
          style={{
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.75rem",
          }}
          p="xl"
        >
          <Loader size="xl" />
        </Center>
      </Stack>
    );
  }

  if (initialized && todos.length === 0) {
    return (
      <Stack
        p="xl"
        bdrs="lg"
        className="empty-state todo"
        bd="2px dashed var(--empty-card-border)"
        bg="var(--surface-color)"
        flex={1}
      >
        <Center
          display="flex"
          style={{
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.75rem",
          }}
          p="xl"
        >
          <Image src={noTodosImg} w="8rem" h="6.5rem" />
          <Title order={3} ta="center" fw="semibold">
            Nothing left to sort out - yet
          </Title>
          <Text c="dimmed" ta="center">
            Keep visas, bookings and packing in one list. Anyone you’ve shared
            the trip with can tick items of.
          </Text>
          <CanEditTrip>
            <TodoModal tripId={tripId} />
          </CanEditTrip>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack gap="md" flex={1} miw={0}>
      <Group justify="space-between">
        <Text size="sm" c="dimmed" fw="bold">
          {`${todos.filter((s) => s.is_complete).length} of ${todos.length} done`}
        </Text>
        <CanEditTrip>
          <TodoModal tripId={tripId} />
        </CanEditTrip>
      </Group>
      {todos
        .sort(function compare(a, b) {
          return dayjs(a.due_date).diff(dayjs(b.due_date));
        })
        .map((todo) => (
          <TodoCard tripId={tripId} todo={todo} />
        ))}
    </Stack>
  );
};
