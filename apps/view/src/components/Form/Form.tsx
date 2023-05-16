import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  SubmitErrorHandler,
  useForm,
} from "react-hook-form";
import { Resolver } from "@hookform/resolvers/zod";
import { HTMLAttributes } from "react";
import { InputHookForm } from "./Input";
import { ToggleButtonsHookForm } from "./ToggleButtons";
import { SelectHookForm } from "./Select";
import { RadioGroupHookForm } from "./RadioGroup";
import { Submitter } from "./Submitter";

type Props<T extends FieldValues> = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onError"
> & {
  children: React.ReactNode | React.ReactNode[];
  onSubmit?: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  resolver?: ReturnType<Resolver>;
};

export const Form = <T extends FieldValues>({
  children,
  onSubmit = () => {},
  onError = () => {},
  resolver,
  ...rest
}: Props<T>) => {
  const methods = useForm<T>({
    resolver,
  });

  return (
    <FormProvider {...methods}>
      <form {...rest} onSubmit={methods.handleSubmit(onSubmit, onError)}>
        {children}
      </form>
    </FormProvider>
  );
};

Form.Input = InputHookForm;
Form.Select = SelectHookForm;
Form.ToggleButtons = ToggleButtonsHookForm;
Form.Radio = RadioGroupHookForm;
Form.Submit = Submitter;
