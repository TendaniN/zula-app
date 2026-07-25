import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "./types";
import "./styles.scss";

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
}

export const IconButton = ({
  icon,
  variant = "primary",
  size = "md",
  className,
  type = "button",
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
    {...props}
  >
    {icon}
  </button>
);
