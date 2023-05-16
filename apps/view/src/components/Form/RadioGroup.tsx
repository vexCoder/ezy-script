import {
  Radio as BaseRadio,
  RadioProps as BaseRadioProps,
  RadioGroupProps as BaseRadioGroupProps,
  Flex,
  RadioGroupStylesNames,
  FlexProps,
} from "@mantine/core";
import { mergeClassNames } from "@utils/react.helper";
import { ForwardedRef, forwardRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { Field } from "./Field";

export type RadioGroupProps = FormTypes.InputProps<
  Omit<BaseRadioGroupProps, "data" | "children"> & {
    options: FormTypes.Option<{ props?: BaseRadioProps }>[];
    onChange?: BaseRadioGroupProps["onChange"];
    fullWidth?: boolean;
    orientation?: FlexProps["direction"];
    spacing?: FlexProps["gap"];
    flexProps?: FlexProps;
    size?: BaseRadioProps["size"];
  },
  HTMLInputElement
>;

export const RadioGroupInner = (
  {
    options,
    classNames,
    className,
    error,
    label,
    description,
    fullWidth,
    orientation,
    flexProps,
    required,
    spacing = "sm",
    size = "sm",
    ...inputProps
  }: RadioGroupProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const defaultClasses: Partial<Record<RadioGroupStylesNames, string>> = {};

  return (
    <BaseRadio.Group
      ref={ref}
      classNames={mergeClassNames(defaultClasses, classNames)}
      className={clsx(fullWidth && "w-full", className)}
      error={!!error}
      withAsterisk={required}
      inputContainer={(children) => (
        <Field error={error} label={label} description={description}>
          {children}
        </Field>
      )}
      {...inputProps}
    >
      <Flex
        className="mt-3 mb-3"
        direction={orientation}
        gap={spacing}
        {...flexProps}
      >
        {options.map((option) => (
          <BaseRadio
            key={option.value}
            value={option.value}
            label={option.label}
            size={size}
            {...(option.props || {})}
          />
        ))}
      </Flex>
    </BaseRadio.Group>
  );
};

export const RadioGroup = forwardRef(RadioGroupInner) as (
  props: RadioGroupProps & { ref?: React.ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof RadioGroupInner>;

export const RadioGroupHookForm = ({
  name,
  registerOptions,
  options,
  defaultValue: baseDefaultValue,
  ...rest
}: FormTypes.HookFormProps<RadioGroupProps>) => {
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
          <RadioGroup
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
