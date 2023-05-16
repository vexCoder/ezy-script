import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Flex, Stack } from "@mantine/core";
import { Input, InputProps } from "./Input";

export default {
  title: "Forms/Input",
  component: Input,
} as ComponentMeta<typeof Input>;

type InputStoryProps = {
  params: InputProps[][];
};

const InputStory = ({ params }: InputStoryProps) => {
  return (
    <Flex gap="xl" className="w-full">
      {params.map((items) => (
        <Stack spacing="xs" className="w-[33%]">
          {items.map((p) => (
            <Input {...p} />
          ))}
        </Stack>
      ))}
    </Flex>
  );
};

const BaseTemplate: ComponentStory<typeof InputStory> = (props) => (
  <InputStory {...props} />
);

const params: InputProps[][] = [];

params.push([
  {
    name: "test",
    label: "Label",
  },
  {
    name: "test",
    label: "Label",
    size: "sm",
  },
  {
    name: "test",
    label: "Label",
    size: "md",
  },
  {
    name: "test",
    label: "Label",
    size: "lg",
  },
  {
    name: "test",
    label: "Label",
    size: "xl",
  },
]);

params.push([
  {
    name: "test",
    label: "Label",
    size: "xs",
    error: "This is an error",
  },
  {
    name: "test",
    label: "Label",
    placeholder: "Placeholder",
    description: "Description",
    size: "xs",
    error: "This is an error",
  },
]);

export const Component = BaseTemplate.bind({});
Component.story = {
  name: "Input",
  args: {
    params,
  },
};
