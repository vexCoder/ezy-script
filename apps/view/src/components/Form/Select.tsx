import {
  Select as BaseSelect,
  SelectProps as BaseSelectProps,
  SelectStylesNames,
} from "@mantine/core";
import { mergeClassNames } from "@utils/react.helper";
import { ForwardedRef, forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { Field } from "./Field";

export type SelectProps = FormTypes.InputProps<
  Omit<BaseSelectProps, "data"> & {
    options: BaseSelectProps["data"];
    onChange?: BaseSelectProps["onChange"];
    fullWidth?: boolean;
  },
  HTMLInputElement
>;

export const SelectInner = (
  {
    options,
    classNames,
    className,
    error,
    label,
    description,
    fullWidth,
    ...inputProps
  }: SelectProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const defaultClasses: Partial<Record<SelectStylesNames, string>> = {};

  return (
    <BaseSelect
      ref={ref}
      data={options}
      classNames={mergeClassNames(defaultClasses, classNames)}
      className={clsx(fullWidth && "w-full", className)}
      error={!!error}
      inputContainer={(children) => (
        <Field error={error} label={label} description={description}>
          {children}
        </Field>
      )}
      {...inputProps}
    />
  );
};

export const Select = forwardRef(SelectInner) as (
  props: SelectProps & { ref?: React.ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof SelectInner>;

export const SelectHookForm = ({
  name,
  registerOptions,
  ...rest
}: FormTypes.HookFormProps<SelectProps>) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={registerOptions}
      render={({ field }) => {
        return (
          <Select
            {...rest}
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
