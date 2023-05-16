import { useFormContext } from "react-hook-form";
import { TextInput, TextInputProps, TextInputStylesNames } from "@mantine/core";
import { mergeClassNames } from "@utils/react.helper";
import { forwardRef } from "react";
import { Field } from "./Field";

export type InputProps = FormTypes.InputProps<TextInputProps>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ classNames, label, description, error, ...props }, ref) => {
    const defaultClasses: Partial<Record<TextInputStylesNames, string>> = {};
    return (
      <TextInput
        {...props}
        ref={ref}
        classNames={mergeClassNames(defaultClasses, classNames)}
        error={!!error}
        inputContainer={(children) => (
          <Field error={error} label={label} description={description}>
            {children}
          </Field>
        )}
      />
    );
  }
);

export const InputHookForm = ({
  name,
  registerOptions,
  ...rest
}: FormTypes.HookFormProps<InputProps>) => {
  const { register } = useFormContext();
  return <Input {...rest} {...register(name, registerOptions)} />;
};
