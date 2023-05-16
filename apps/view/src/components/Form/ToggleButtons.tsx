import {
  SegmentedControl,
  SegmentedControlProps,
  SegmentedControlStylesNames,
} from "@mantine/core";
import { mergeClassNames } from "@utils/react.helper";
import clsx from "clsx";
import { ForwardedRef, forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

export type ToggleButtonsProps = FormTypes.InputProps<
  Omit<SegmentedControlProps, "data"> & {
    options: SegmentedControlProps["data"];
    fullWidth?: boolean;
  },
  HTMLInputElement,
  "label" | "description"
>;

const ToggleButtonsInner = (
  {
    options,
    classNames,
    error,
    className,
    fullWidth,
    ...inputProps
  }: ToggleButtonsProps,
  ref: ForwardedRef<HTMLInputElement | HTMLDivElement>
) => {
  const defaultClasses: Partial<Record<SegmentedControlStylesNames, string>> =
    {};

  return (
    <SegmentedControl
      ref={ref}
      data={options}
      classNames={mergeClassNames(defaultClasses, classNames)}
      className={clsx(fullWidth && "w-full", "box-border", className)}
      {...inputProps}
    />
  );
};

export const ToggleButtons = forwardRef(ToggleButtonsInner) as (
  props: ToggleButtonsProps & { ref?: React.ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof ToggleButtonsInner>;

export const ToggleButtonsHookForm = ({
  name,
  registerOptions,
  options,
  defaultValue: baseDefaultValue,
  ...rest
}: FormTypes.HookFormProps<ToggleButtonsProps>) => {
  const { control } = useFormContext();

  const firstValue = options[0];
  const defaultValue =
    baseDefaultValue ||
    (typeof firstValue === "object" ? firstValue.value : firstValue);

  return (
    <Controller
      control={control}
      name={name}
      rules={registerOptions}
      defaultValue={defaultValue}
      render={({ field }) => {
        return (
          <ToggleButtons
            {...rest}
            options={options}
            name={field.name}
            ref={field.ref}
            value={field.value as string}
            onChange={(value) => {
              field.onChange(value);
            }}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
};
