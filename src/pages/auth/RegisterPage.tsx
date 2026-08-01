import {
  Alert,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { AuthHeader } from "./AuthHeader";
import "./styles.scss";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { RegisterSchema } from "./schema";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const { signUp, user, error } = useAuthStore();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState("");

  const { handleSubmit, Field } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      username: "",
    },

    onSubmit: async ({ value }) => {
      const { success } = RegisterSchema.safeParse(value);
      if (success) {
        await signUp(value.email, value.password, {
          first_name: value.firstName,
          last_name: value.lastName,
          username: value.username,
        });

        if (error) {
          setFormErrors(error);
        }
        navigate("/login");
      }
    },
  });

  useEffect(() => {
    if (user) {
      navigate("/trips");
    }
  }, [navigate, user]);

  return (
    <Stack gap={0} h="100%">
      <Stack gap="lg" my="auto">
        <AuthHeader title="Register" />
        <Title>Create your account</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            handleSubmit();
          }}
        >
          <Stack gap="md">
            <Group grow>
              <Field name="firstName">
                {(field) => (
                  <TextInput
                    required
                    type="text"
                    label="First Name"
                    placeholder="John"
                    autoComplete="given-name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </Field>
              <Field name="lastName">
                {(field) => (
                  <TextInput
                    required
                    type="text"
                    label="Last Name"
                    placeholder="Doe"
                    autoComplete="family-name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </Field>
            </Group>

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
            <Field name="username">
              {(field) => (
                <TextInput
                  required
                  type="username"
                  label="Username"
                  placeholder="JohnD"
                  autoComplete="nickname"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  error={field.state.meta.errors[0]}
                />
              )}
            </Field>
            <Group grow>
              <Field name="password">
                {(field) => (
                  <PasswordInput
                    required
                    label="Password"
                    placeholder="Enter password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </Field>
              <Field name="confirmPassword">
                {(field) => (
                  <PasswordInput
                    required
                    label="Confirm Password"
                    placeholder="Enter password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    error={field.state.meta.errors[0]}
                  />
                )}
              </Field>
            </Group>

            <Button type="submit" fluid>
              Create account
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
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
}
