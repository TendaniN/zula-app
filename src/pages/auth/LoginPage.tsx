import {
  Alert,
  Divider,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { AuthHeader } from "./AuthHeader";
import "./styles.scss";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { LoginSchema } from "./schema";
import { Button } from "@/components/ui";
import { FaArrowRightLong } from "react-icons/fa6";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { signInWithPassword, user, error } = useAuthStore();

  const [formErrors, setFormErrors] = useState("");

  const { handleSubmit, Field } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      const { success } = LoginSchema.safeParse(value);
      if (success) {
        await signInWithPassword(value.email, value.password);

        if (error) {
          setFormErrors(error);
        }
      }
    },
  });

  useEffect(() => {
    if (!user) return;

    const next = searchParams.get("next");
    const isInternal = !!next && next.startsWith("/") && !next.startsWith("//");

    navigate(isInternal ? next : "/trips", { replace: true });
  }, [navigate, user, searchParams]);

  return (
    <Stack gap={0} h="100%">
      <Stack gap="lg" my="auto">
        <AuthHeader title="Login" />
        <Title>Welcome back ✨</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            handleSubmit();
          }}
        >
          <Stack gap="md">
            <Field name="email">
              {(field) => (
                <TextInput
                  required
                  type="email"
                  label="Email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </Field>

            <Field name="password">
              {(field) => (
                <PasswordInput
                  required
                  label="Password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </Field>
            <Link to="/forgot-password" className="link">
              Forgot password?
            </Link>

            <Button type="submit" fluid rightSection={<FaArrowRightLong />}>
              Log In
            </Button>
            {formErrors !== "" && (
              <Alert variant="light" color="red">
                {formErrors}
              </Alert>
            )}
          </Stack>
        </form>

        <Divider />

        <Text ta="center" size="sm">
          New here?{" "}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
}
