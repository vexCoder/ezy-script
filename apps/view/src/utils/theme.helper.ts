import { CSSObject } from "@mantine/core";

export const makeCSSUtils = () => {
  return {
    center: (type: "absolute" = "absolute", selector?: string) => {
      let css: CSSObject = {};
      if (type === "absolute") {
        css = {
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        };
      }

      if (selector) {
        return {
          [selector]: css,
        };
      }

      return css;
    },
  };
};
