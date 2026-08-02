import type { TripFilter } from "@/constants/status";
import { Badge, Divider } from "@mantine/core";

interface FilterChipProps {
  children: React.ReactNode;
  active: boolean;
  id: TripFilter;
  onClick: (id: TripFilter) => void;
}

export const FilterChip = ({
  children,
  active,
  onClick,
  id,
}: FilterChipProps) => {
  const handleSelect = () => {
    if (!active) {
      onClick(id);
    }
  };

  if (id === "archived") {
    return (
      <>
        <Divider orientation="vertical" color="" />
        <Badge
          tt="capitalize"
          color={active ? "peach.3" : "lavender.0"}
          size="xl"
          c={active ? "var(--text-color)" : "gray.6"}
          py="md"
          px="lg"
          fz="sm"
          fw="bold"
          bd={
            active
              ? "2px solid var(--border-color)"
              : "2px dashed var(--border-color)"
          }
          style={{ cursor: "pointer" }}
          onClick={() => handleSelect()}
        >
          {children}
        </Badge>
      </>
    );
  }

  return (
    <Badge
      tt="capitalize"
      color={active ? "lavender.3" : "lavender.0"}
      size="xl"
      c={active ? "var(--text-color)" : "gray.6"}
      py="md"
      px="lg"
      fz="sm"
      fw="bold"
      bd="2px solid var(--border-color)"
      style={{ cursor: "pointer" }}
      onClick={() => handleSelect()}
    >
      {children}
    </Badge>
  );
};
