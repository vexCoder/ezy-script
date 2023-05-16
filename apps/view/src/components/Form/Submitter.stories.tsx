import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Flex, Stack } from "@mantine/core";
import { Submitter, SubmitterProps } from "./Submitter";

export default {
  title: "Forms/Submitter",
  component: Submitter,
} as ComponentMeta<typeof Submitter>;

type SubmitterStoryProps = {
  params: SubmitterProps[][];
};

const SubmitterStory = ({ params }: SubmitterStoryProps) => {
  return (
    <Flex gap="xl" className="w-full">
      {params.map((items) => (
        <Stack key={JSON.stringify(items)} spacing="xs" className="w-[33%]">
          {items.map((p) => (
            <Submitter key={JSON.stringify(p)} {...p}>
              <Submitter.Cancel />
              <Submitter.Ok />
            </Submitter>
          ))}
        </Stack>
      ))}
    </Flex>
  );
};

const BaseTemplate: ComponentStory<typeof SubmitterStory> = (props) => (
  <SubmitterStory {...props} />
);

const params: SubmitterProps[][] = [];

params.push([
  {
    size: "xs",
  },
  {
    size: "sm",
  },
  {
    size: "md",
  },
  {
    size: "lg",
  },
  {
    size: "xl",
  },
]);

export const Component = BaseTemplate.bind({});
Component.story = {
  name: "Submitter",
  args: {
    params,
  },
};
