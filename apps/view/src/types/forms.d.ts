declare namespace FormTypes {
  type HookFormProps<T extends InputProps> = {
    name: string;
    registerOptions?: import("react-hook-form").RegisterOptions<
      import("react-hook-form").FieldValues,
      string
    >;
  } & T;

  type InputProps<
    T extends {} = {},
    Element = HTMLInputElement,
    Omitted = undefined
  > = Omit<React.HTMLAttributes<Element> & BaseFieldProps<Element> & T, Omitted>;

  type BaseFieldProps<Element = HTMLInputElement> = {
    label?: string;
    description?: string;
    placeholder?: string;
    className?: string;
    error?: string;
    required?: boolean;
  };

  type Option<T = {}> = {
    value: string;
    label: string | React.ReactNode;
  } & T;

  type ErrorHandler<F extends import("react-hook-form").FieldValues> = import("react-hook-form").SubmitErrorHandler<F>;
  type SubmitHandler<F extends import("react-hook-form").FieldValues> = import("react-hook-form").SubmitHandler<F>
}
