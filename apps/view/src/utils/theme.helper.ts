import { CSSObject } from "@mantine/core";

export function makeCSSUtils() {
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
    spacing(
      s0: number | string,
      ...sN: [s1?: number | string, s2?: number | string, s3?: number | string]
    ) {
      const sizes = [s0, ...sN].map((n) =>
        typeof n === "number" ? `${n}em` : n
      );

      if (!sN.length) return sizes[0];
      if (sizes.length === 2) return `${sizes[0]} ${sizes[1]}`;
      if (sizes.length === 3) sizes.push("0px");
      return sizes.join(" ");
    },
  };
}
