import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import type { ButtonSize, ButtonVariant } from "./types";
import "./styles.scss";

type NativeButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface ButtonProps extends NativeButtonProps {
  children: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  variant?: ButtonVariant;
  fluid?: boolean;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = ({
  children,
  leftSection,
  rightSection,
  variant = "primary",
  fluid = false,
  className,
  type = "button",
  size = "md",
  loading,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={clsx(
      "button",
      `button--${variant}`,
      `button--${size}`,
      {
        "button--fluid": fluid,
      },
      className,
    )}
    disabled={loading || disabled}
    {...props}
  >
    {leftSection && leftSection}
    {children && children}
    {rightSection && rightSection}
  </button>
);
