import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import "./styles.scss";

type NativeButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface ButtonProps extends NativeButtonProps {
  children: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dashed";
  fluid?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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
    {...props}
  >
    {leftSection && leftSection}
    {children && children}
    {rightSection && rightSection}
  </button>
);
