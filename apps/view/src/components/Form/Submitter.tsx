import {
  Button,
  ButtonProps,
  ButtonStylesNames,
  Group,
  GroupProps,
} from "@mantine/core";
import { mergeClassNames } from "@utils/react.helper";
import clsx from "clsx";
import { CSSProperties, Children, cloneElement, isValidElement } from "react";

export type SubmitterProps = {
  className?: string;
  style?: CSSProperties;
  label?: string;
  cancelLabel?: string;
  children?: React.ReactNode;
  size?: ButtonProps["size"];
  fullWidth?: boolean;
  spacing?: GroupProps["spacing"];
};

export const Submitter = ({
  children = [],
  size,
  fullWidth,
  className,
  spacing = "xs",
  ...props
}: SubmitterProps) => {
  const ValidChildren = Children.map(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === Submitter.Cancel || child.type === Submitter.Ok)
    ) {
      return cloneElement(child, {
        size,
      } as SubmitterButtonProps);
    }

    return null;
  });

  return (
    <Group
      className={clsx(fullWidth && "w-full", className)}
      spacing={spacing}
      {...props}
    >
      {ValidChildren}
    </Group>
  );
};

export type SubmitterButtonProps = ButtonProps & {
  classNames?: Record<ButtonStylesNames, string>;
  children?: React.ReactNode;
  onClick?: () => void;
};

const OKButton = ({
  classNames,
  children = "Submit",
  onClick,
  type = "submit",
  variant = "filled",
  ...props
}: SubmitterButtonProps) => {
  const defaultButtonClasses: Partial<Record<ButtonStylesNames, string>> = {
    root: "bg-blue-500 transition-colors flex-1",
  };

  return (
    <Button
      classNames={mergeClassNames(classNames, defaultButtonClasses)}
      type={type}
      onClick={onClick}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

const CancelButton = ({
  classNames,
  children = "Cancel",
  onClick,
  variant = "outline",
  ...props
}: SubmitterButtonProps) => {
  const defaultButtonClasses: Partial<Record<ButtonStylesNames, string>> = {
    root: "border-gray-300 text-gray-400 hover:bg-gray-300 hover:text-white  transition-colors flex-1",
  };

  return (
    <Button
      classNames={mergeClassNames(classNames, defaultButtonClasses)}
      onClick={onClick}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

Submitter.Ok = OKButton;
Submitter.Cancel = CancelButton;
