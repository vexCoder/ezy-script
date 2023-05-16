import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Center, Flex, Stack, Text } from "@mantine/core";
import {
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
} from "@tabler/icons-react";
import { ToggleButtons, ToggleButtonsProps } from "./ToggleButtons";

const defaultOpts = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

const defaultOptsIcons: ToggleButtonsProps["options"] = [
  {
    label: (
      <Center>
        <IconAlignLeft size="1rem" />
        <Text className="ml-3">Left</Text>
      </Center>
    ),
    value: "1",
  },
  {
    label: (
      <Center>
        <IconAlignJustified size="1rem" />
        <Text className="ml-3">Justify</Text>
      </Center>
    ),
    value: "2",
  },
  {
    label: (
      <Center>
        <IconAlignRight size="1rem" />
        <Text className="ml-3">Right</Text>
      </Center>
    ),
    value: "3",
  },
];

export default {
  title: "Forms/ToggleButtons",
  component: ToggleButtons,
} as ComponentMeta<typeof ToggleButtons>;

type SelectStoryProps = {
  params: ToggleButtonsProps[][];
};

const SelectStory = ({ params }: SelectStoryProps) => {
  return (
    <Flex gap="xl" className="w-full">
      {params.map((items, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Stack key={`column-${i}`} spacing="xs">
          {items.map((p, j) => (
            // eslint-disable-next-line react/no-array-index-key
            <ToggleButtons key={`row-${j}`} {...p} />
          ))}
        </Stack>
      ))}
    </Flex>
  );
};

const BaseTemplate: ComponentStory<typeof SelectStory> = (props) => (
  <SelectStory {...props} />
);

const params: ToggleButtonsProps[][] = [];

params.push([
  {
    options: defaultOpts,
  },
  {
    size: "sm",
    options: defaultOpts,
  },
  {
    size: "md",
    options: defaultOpts,
  },
  {
    size: "lg",
    options: defaultOpts,
  },
  {
    size: "xl",
    options: defaultOpts,
  },
]);

params.push([
  {
    size: "xs",
    options: defaultOpts,
  },
  {
    size: "xs",
    options: defaultOpts,
  },
  {
    size: "xs",
    options: defaultOptsIcons,
  },
]);

export const Component = BaseTemplate.bind({});
Component.story = {
  name: "ToggleButtons",
  args: {
    params,
  },
};
