import {
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { FaRegTrashCan } from "react-icons/fa6";
import { Button } from "../Button";

interface DeleteModalProps {
  opened: boolean;
  close: () => void;
  item: string;
  name: string;
  confirm: () => Promise<void>;
}

export const DeleteModal = ({
  opened,
  close,
  confirm,
  item,
  name,
}: DeleteModalProps) => {
  const tripContent = (
    <Stack gap="xs">
      <Text size="sm" c="dimmed">
        {`"${name}" and all its stays, transport and to-dos will be permanently removed. This can't be undone.`}
      </Text>
      <Text fs="italic" size="sm" c="dimmed" ta="center">
        Rather keep it? Archive it instead.
      </Text>
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="sm"
      title={
        <Stack gap="xs">
          <ThemeIcon size="lg" color="red" radius="md" c="var(--border-color)">
            <FaRegTrashCan />
          </ThemeIcon>
          <Title order={4} lh={1} fw="bold">
            Delete this {item}?
          </Title>
        </Stack>
      }
    >
      <Stack gap="md">
        {item === "trip" ? (
          tripContent
        ) : (
          <Text
            size="sm"
            c="dimmed"
          >{`Delete "${name}"? This can't be undone.`}</Text>
        )}

        <SimpleGrid cols={2}>
          <Button fluid variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button fluid variant="danger" onClick={confirm}>
            Delete
          </Button>
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};
