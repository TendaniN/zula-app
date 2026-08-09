import { Card, Text } from "@mantine/core";

export const AuthHeader = ({ title }: { title: string }) => {
  return (
    <Card w="100%" p="md" bdrs="lg" className="auth-header">
      <Text fz="xl" ta="center" fw="bold">
        {title}
      </Text>
    </Card>
  );
};
