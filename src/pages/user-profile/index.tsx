import {
  Badge,
  Box,
  Card,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { getFullName } from "@/utils/getFullName";
import { getInitials } from "@/utils/getInitials";
import { useForm } from "@tanstack/react-form";
import { ProfileSchema, type ProfileFormValues } from "./schema";
import { LuTrash2 } from "react-icons/lu";

export default function UserProfilePage() {
  const { profile, updateProfile } = useAuthStore();

  const form = useForm({
    defaultValues: {
      email: profile?.email ?? "",
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      username: profile?.username ?? "",
    } as ProfileFormValues,
    onSubmit: async ({ value, formApi }) => {
      const result = ProfileSchema.safeParse(value);

      if (result.success) {
        if (profile) {
          await updateProfile({
            email: value.email,
            first_name: value.firstName,
            last_name: value.lastName,
            username: value.username,
            id: profile.id,
          });
        }
      } else {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            formApi.setFieldMeta(field as keyof ProfileFormValues, (m) => ({
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

  if (!profile) {
    return null;
  }

  return (
    <Stack h="100%" p={0} gap={0} mih={0}>
      <Stack
        bg="var(--surface-color)"
        style={{ borderBottom: "2px solid var(--border-color)" }}
        px={{ base: "lg", sm: "xl" }}
        py="md"
        gap="sm"
      >
        <Stack gap={2}>
          <Title fw="bold">Your profile</Title>
          <Text fz="md" c="dimmed">
            How you show up on shared trips - and where you're signed in.
          </Text>
        </Stack>
      </Stack>
      <ScrollArea flex={1} mih={0} type="auto" offsetScrollbars>
        <Stack p="xl">
          <Card style={{ boxShadow: `0 4px 0 var(--bg-secondary)` }}>
            <Group>
              <ThemeIcon
                bg="var(--aurora)"
                bd="2px solid var(--border-color)"
                c="var(--border-color)"
                radius="5rem"
                size="5rem"
              >
                <Text size="xl" fw="bold">
                  {getInitials(profile)}
                </Text>
              </ThemeIcon>

              <Stack gap={0}>
                <Group>
                  <Text fw="bold">{getFullName(profile)}</Text>
                  <Badge variant="outline">{profile.app_role}</Badge>
                </Group>
                {profile.email && <Text size="sm">{profile.email}</Text>}
                {profile.username && (
                  <Text c="dimmed" size="sm">{`@${profile.username}`}</Text>
                )}
              </Stack>
            </Group>
          </Card>
          <Card style={{ boxShadow: `0 4px 0 var(--bg-secondary)` }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <Stack gap="md" p="lg">
                <Group grow>
                  <form.Field name="firstName">
                    {(field) => (
                      <TextInput
                        required
                        label="First name"
                        placeholder="e.g. Jane"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        autoComplete="given-name"
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                        data-autofocus
                      />
                    )}
                  </form.Field>
                  <form.Field name="lastName">
                    {(field) => (
                      <TextInput
                        required
                        label="Last name"
                        placeholder="e.g. Doe"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        autoComplete="family-name"
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>
                </Group>
                <Group grow>
                  <form.Field name="username">
                    {(field) => (
                      <TextInput
                        label="Username"
                        placeholder="janedoe"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        autoComplete="username"
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                        description="Unique - others may invite you by @username or email."
                      />
                    )}
                  </form.Field>
                  <form.Field name="email">
                    {(field) => (
                      <TextInput
                        required
                        label="Email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        description="Changing this sends a confirmation link."
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors[0]}
                      />
                    )}
                  </form.Field>
                </Group>
                <Divider />
                <Group gap="md" justify="center">
                  <Button
                    variant="ghost"
                    onClick={() => form.reset}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <form.Subscribe selector={(s) => s.isSubmitting}>
                    {(isSubmitting) => (
                      <Button type="submit" loading={isSubmitting}>
                        Save
                      </Button>
                    )}
                  </form.Subscribe>
                </Group>
              </Stack>
            </form>
          </Card>

          <Box bd="2px dashed var(--mantine-color-peach-4)" p="lg" bdrs="lg">
            <Group justify="space-between">
              <Stack gap="2">
                <Text fw={600} size="sm">
                  Delete account?
                </Text>
                <Text c="dimmed" size="sm">
                  Trips you own are deleted for everyone. Trips you were invited
                  to stay with their owner.
                </Text>
              </Stack>
              <Button variant="ghost" leftSection={<LuTrash2 />} size="xs">
                Delete
              </Button>
            </Group>
          </Box>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
