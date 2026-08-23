import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "./types";
import "./styles.scss";
import { Loader } from "@mantine/core";

type NativeButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface IconButtonProps extends Omit<NativeButtonProps, "children"> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Required: icon-only buttons have no visible text, so they need an accessible name. */
  "aria-label": string;
  loading?: boolean;
}

export const IconButton = ({
  icon,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  loading = false,
  disabled = false,
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    className={clsx(
      "button",
      "button--icon",
      `button--${variant}`,
      `button--${size}`,
      className,
    )}
    disabled={loading || disabled}
    {...props}
  >
    {loading ? <Loader size="sm" color="var(--mantine-color-dark-7)" /> : icon}
  </button>
);
