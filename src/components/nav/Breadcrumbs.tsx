import type { TripSummaryRow } from "@/types/models";
import { Anchor, Breadcrumbs as BaseBreadcrumbs, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { BiChevronRight } from "react-icons/bi";

interface BreadcrumbsProps {
  trip: TripSummaryRow;
  tab: string;
}

export const Breadcrumbs = ({ trip, tab }: BreadcrumbsProps) => {
  const items = [
    { title: "My trips", href: "/trips" },
    { title: trip.name, href: `/trips/${trip.id}` },
    { title: tab, href: "#" },
  ].map((item) => (
    <Anchor
      component={Link}
      to={item.href}
      key={`anchor-${item.title}`}
      size="sm"
      fw="bold"
      c={item.title === tab ? "var(--text-color)" : "dimmed"}
      underline="never"
    >
      {item.title}
    </Anchor>
  ));

  return (
    <Group
      bg="var(--surface-color)"
      style={{ borderBottom: "2px solid var(--border-color)" }}
      px="xl"
      py="md"
    >
      <BaseBreadcrumbs
        separator={<BiChevronRight size="0.75rem" />}
        separatorMargin={4}
      >
        {items}
      </BaseBreadcrumbs>
    </Group>
  );
};
