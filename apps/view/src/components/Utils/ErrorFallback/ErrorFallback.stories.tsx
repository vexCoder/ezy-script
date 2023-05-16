import { ComponentStory, ComponentMeta } from "@storybook/react";

import { ErrorFallback } from "./ErrorFallback";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Utils/ErrorFallback",
  component: ErrorFallback,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof ErrorFallback>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ErrorFallback> = (args) => (
  <ErrorFallback {...args} />
);

export const Error1 = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Error1.args = {
  error: new Error("Invalid argument"),
};

export const Error2 = Template.bind({});
Error2.args = {
  error: new Error("Fetch Error"),
};
