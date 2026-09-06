import { useState } from "react";
import {
  Avatar,
  Badge,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { LuX } from "react-icons/lu";
import { PiShareNetworkBold } from "react-icons/pi";

import { Modal, Button, IconButton } from "./ui";
import { getFullName } from "@/utils/getFullName";
import { useTripStore, type PendingInvite } from "@/stores/tripStore";
import type { Trip, TripMemberWithProfile } from "@/types/models";

export type AssignableRole = "editor" | "viewer";

const ROLE_OPTIONS: { value: AssignableRole; label: string }[] = [
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

interface ShareModalProps {
  trip: Trip;
  members: TripMemberWithProfile[];
  currentUserId?: string | null;
  pendingInvites?: PendingInvite[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleLabel = (role: AssignableRole) =>
  role === "editor" ? "Editor" : "Viewer";

const GRADIENT_COLORS = ["aurora", "bloom", "meadow", "seaform"] as const;

export const ShareModal = ({
  trip,
  members,
  currentUserId,
  pendingInvites = [],
}: ShareModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  // Writes owned by the modal, via the store — add these actions to tripStore.
  const {
    inviteMember,
    changeMemberRole,
    removeMember,
    resendInvite,
    revokeInvite,
  } = useTripStore();

  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AssignableRole>("viewer");
  const [sending, setSending] = useState(false);
  // Row-level busy marker (removes / resends / revokes) keyed by member id or
  // invite email, so a single row can show a spinner without blocking others.
  const [busyId, setBusyId] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const peopleCount = members.length + pendingInvites.length;

  const handleSend = async () => {
    if (!emailValid) return;
    setSending(true);
    try {
      await inviteMember(trip.id, email.trim().toLowerCase(), inviteRole);
      setEmail("");
    } catch (err) {
      console.error("Invite failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleChangeRole = async (userId: string, role: AssignableRole) => {
    try {
      await changeMemberRole(trip.id, userId, role);
    } catch (err) {
      console.error("Role change failed:", err);
    }
  };

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        close={close}
        title="Share this trip"
        size="md"
        description={trip.name}
      >
        <Stack gap="lg" p="lg">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <TextInput
              flex={1}
              placeholder="name@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              error={
                email.length > 0 && !emailValid ? "Enter a valid email" : null
              }
              my="auto"
            />
            <Select
              w={120}
              data={ROLE_OPTIONS}
              value={inviteRole}
              onChange={(v) => setInviteRole((v as AssignableRole) ?? "viewer")}
              allowDeselect={false}
              checkIconPosition="right"
              comboboxProps={{ withinPortal: true }}
              my="auto"
            />
            <Button
              onClick={handleSend}
              disabled={!emailValid}
              loading={sending}
            >
              Send
            </Button>
          </Group>

          {/* People with access */}
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" fw="bold" c="dimmed" tt="uppercase">
                People with access
              </Text>
              <Text size="xs" c="dimmed" fw={600}>
                {`${peopleCount} ${peopleCount === 1 ? "person" : "people"}`}
              </Text>
            </Group>

            {/* Members */}
            {members.map((m, index) => {
              const name = getFullName(m.profile);
              const memberEmail = m.profile?.email ?? "";
              const isYou = !!currentUserId && m.user_id === currentUserId;
              const isOwner = m.role === "owner";
              const assignableRole: AssignableRole =
                (m.role as string) === "editor" ? "editor" : "viewer";

              return (
                <Group
                  key={`member-${m.user_id}`}
                  justify="space-between"
                  wrap="nowrap"
                  gap="sm"
                  py="xs"
                >
                  <Group gap="sm" wrap="nowrap" miw={0} flex={1}>
                    <ThemeIcon
                      radius="xl"
                      size="lg"
                      bd="2px solid var(--border-color)"
                      bg={`var(--${GRADIENT_COLORS[index % GRADIENT_COLORS.length]})`}
                      c="var(--border-color)"
                      fw="bold"
                    >
                      {name.charAt(0)}
                    </ThemeIcon>
                    <Stack gap={0} miw={0}>
                      <Group gap="xs" wrap="nowrap" miw={0}>
                        <Text fw="bold" size="sm" truncate>
                          {isYou ? `You · ${name}` : name}
                        </Text>
                        {isOwner && (
                          <Badge
                            size="sm"
                            variant="light"
                            color="lavender"
                            style={{ flexShrink: 0 }}
                          >
                            Owner
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" truncate>
                        {memberEmail}
                      </Text>
                    </Stack>
                  </Group>

                  {!isOwner && (
                    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                      <Select
                        w={110}
                        data={ROLE_OPTIONS}
                        value={assignableRole}
                        onChange={(v) =>
                          v && handleChangeRole(m.user_id, v as AssignableRole)
                        }
                        allowDeselect={false}
                        checkIconPosition="right"
                        comboboxProps={{ withinPortal: true }}
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<LuX />}
                        aria-label={`Remove ${name}`}
                        loading={busyId === m.user_id}
                        onClick={() =>
                          withBusy(m.user_id, () =>
                            removeMember(trip.id, m.user_id),
                          )
                        }
                      />
                    </Group>
                  )}
                </Group>
              );
            })}

            {/* Pending invites */}
            {pendingInvites.map((inv) => (
              <Group
                key={`invite-${inv.email}`}
                justify="space-between"
                wrap="nowrap"
                gap="sm"
                py="xs"
              >
                <Group gap="sm" wrap="nowrap" flex={1} miw={0}>
                  <Avatar name={inv.email} color="initials" radius="xl" />
                  <Stack gap={0} miw={0}>
                    <Group gap="xs" wrap="nowrap" miw={0}>
                      <Text fw="bold" size="sm" truncate>
                        {inv.email}
                      </Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color="gray"
                        style={{ flexShrink: 0 }}
                      >
                        Pending
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" truncate>
                      {`Invitation sent · ${roleLabel(inv.role)}`}
                    </Text>
                  </Stack>
                </Group>

                <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Button
                    variant="secondary"
                    size="xs"
                    loading={busyId === `resend-${inv.email}`}
                    onClick={() =>
                      withBusy(`resend-${inv.email}`, () =>
                        resendInvite(trip.id, inv.email),
                      )
                    }
                  >
                    Resend
                  </Button>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<LuX />}
                    aria-label={`Revoke invite for ${inv.email}`}
                    loading={busyId === `revoke-${inv.email}`}
                    onClick={() =>
                      withBusy(`revoke-${inv.email}`, () =>
                        revokeInvite(trip.id, inv.email),
                      )
                    }
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Modal>

      {isSmallScreen ? (
        <IconButton
          variant="ghost"
          icon={<PiShareNetworkBold />}
          onClick={open}
          aria-label="Share trip"
          data-tour="share-trip"
        />
      ) : (
        <Button
          variant="tertiary"
          leftSection={<PiShareNetworkBold />}
          onClick={open}
          data-tour="share-trip"
        >
          Share
        </Button>
      )}
    </>
  );
};
