import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Stack } from "@mantine/core";
import { Form } from "./Form";
import { Submitter } from "./Submitter";

export default {
  title: "Forms/Form",
  component: Form,
} as ComponentMeta<"div">;

const defaultOpts = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

const BaseTemplate: ComponentStory<"div"> = () => (
  <Form
    onSubmit={(data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    }}
  >
    <Stack spacing="md" align="flex-start">
      <Form.Input name="input" label="Label" placeholder="Placeholder" />
      <Form.Select
        name="select"
        label="Label"
        placeholder="Placeholder"
        options={defaultOpts}
      />
      <Form.ToggleButtons name="toggles" options={defaultOpts} />
      <Form.Radio
        label="Label"
        description="Description"
        name="radio"
        options={[
          { label: "Test", value: "1" },
          { label: "Test 2", value: "2" },
        ]}
      />
      <Submitter>
        <Submitter.Ok />
      </Submitter>
    </Stack>
  </Form>
);

export const Component = BaseTemplate.bind({});
Component.story = {
  name: "Form",
  args: {},
};
