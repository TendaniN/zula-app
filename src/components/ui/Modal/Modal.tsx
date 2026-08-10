import {
  Group,
  Modal as BaseModal,
  Title,
  type MantineSize,
} from "@mantine/core";
import { IconButton } from "../Button/IconButton";
import { LuX } from "react-icons/lu";

interface ModalProps {
  children: React.ReactNode;
  opened: boolean;
  close: () => void;
  title: string;
  size?: MantineSize | (string & {}) | number;
}

export const Modal = ({
  opened,
  close,
  title,
  children,
  size = "lg",
}: ModalProps) => (
  <BaseModal
    opened={opened}
    onClose={close}
    padding={0}
    title={null}
    overlayProps={{ blur: 2 }}
    size={size}
  >
    {/* Banner header */}
    <Group
      justify="space-between"
      px="lg"
      py="md"
      bg="var(--bg-secondary)"
      style={{
        borderBottom: "2px solid var(--border-color)",
      }}
    >
      <Title order={3} fw="bold" c="var(--text-color)">
        {title}
      </Title>
      <IconButton
        icon={<LuX />}
        variant="ghost"
        aria-label="Close"
        onClick={close}
      />
    </Group>

    {children}
  </BaseModal>
);
