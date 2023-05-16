import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Flex, Stack } from "@mantine/core";
import { RadioGroup, RadioGroupProps } from "./RadioGroup";

const defaultOpts = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

export default {
  title: "Forms/RadioGroup",
  component: RadioGroup,
} as ComponentMeta<typeof RadioGroup>;

type RadioGroupStoryProps = {
  params: RadioGroupProps[][];
};

const RadioGroupStory = ({ params }: RadioGroupStoryProps) => {
  return (
    <Flex gap="xl" className="w-full">
      {params.map((items) => (
        <Stack spacing="xs" className="w-[33%]">
          {items.map((p) => (
            <RadioGroup {...p} />
          ))}
        </Stack>
      ))}
    </Flex>
  );
};

const BaseTemplate: ComponentStory<typeof RadioGroupStory> = (props) => (
  <RadioGroupStory {...props} />
);

const params: RadioGroupProps[][] = [];

params.push([
  {
    label: "Label",
    options: defaultOpts,
  },
  {
    label: "Label",
    size: "sm",
    options: defaultOpts,
  },
  {
    label: "Label",
    size: "md",
    options: defaultOpts,
  },
  {
    label: "Label",
    size: "lg",
    options: defaultOpts,
  },
  {
    label: "Label",
    size: "xl",
    options: defaultOpts,
  },
]);

params.push([
  {
    label: "Label",
    size: "xs",
    error: "This is an error",
    options: defaultOpts,
  },
  {
    label: "Label",
    placeholder: "Placeholder",
    description: "Description",
    size: "xs",
    error: "This is an error",
    options: defaultOpts,
  },
]);

export const Component = BaseTemplate.bind({});
Component.story = {
  name: "RadioGroup",
  args: {
    params,
  },
};
