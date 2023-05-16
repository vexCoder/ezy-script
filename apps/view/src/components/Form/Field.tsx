import { Flex, Input, Tooltip } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Fragment } from "react";

export type FieldProps = {
  children: React.ReactNode | React.ReactNode[];
  wrapper?: boolean;
} & FormTypes.BaseFieldProps;

export const Field = ({
  children,
  label,
  required,
  description,
  error,
  wrapper,
}: FieldProps) => {
  const Wrapper = wrapper ? Input.Wrapper : Fragment;
  return (
    <Wrapper>
      <Flex className="w-full" align="center">
        {label && (
          <Input.Label className="flex-1 leading-none" required={required}>
            {label}
          </Input.Label>
        )}
        {error && (
          <Tooltip
            label={error}
            withArrow
            color="red"
            transitionProps={{ duration: 150 }}
          >
            <IconAlertCircle className="h-[14px] w-4 cursor-pointer text-[0.75rem] text-red-500" />
          </Tooltip>
        )}
      </Flex>
      <div className="mt-1 mb-1">{children}</div>
      {description && <Input.Description>{description}</Input.Description>}
    </Wrapper>
  );
};
