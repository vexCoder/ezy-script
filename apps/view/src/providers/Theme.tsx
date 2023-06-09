import {
  MantineProvider,
  MantineThemeOverride,
  Tuple,
  DefaultMantineColor,
  MantineTheme,
} from "@mantine/core";
import { makeCSSUtils } from "../utils/theme.helper";

type ExtendedCustomColors =
  | "primary"
  | "secondary"
  | "accent"
  | DefaultMantineColor;

declare module "@mantine/core" {
  export interface MantineThemeOther {
    /** Override theme here */
    cssUtils: ReturnType<typeof makeCSSUtils>;
  }

  export interface MantineThemeColorsOverride {
    /** Override theme here */
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}

const overrideTheme: MantineThemeOverride = {
  colors: {
    primary: [
      "#e9e9e9",
      "#a6a6a6",
      "#7a7a7a",
      "#4d4d4d",
      "#212121", // Main 5
      "#1a1a1a",
      "#141414",
      "#0d0d0d",
      "#070707",
      "#000000",
    ],
    secondary: [
      "#67add7",
      "#4ea0d1",
      "#3592ca",
      "#1b85c4",
      "#0277BD", // Main 5
      "#026baa",
      "#025f97",
      "#015384",
      "#014771",
      "#013c5f",
    ],
    accent: [
      "#eef8c8",
      "#ebf7bf",
      "#e9f6b6",
      "#e6f5ad",
      "#e3f4a4", // Main 5
      "#ccdc94",
      "#b6c383",
      "#9fab73",
      "#889262",
      "#727a52",
    ],
  },
  primaryColor: "primary",
  primaryShade: 5,
  other: {
    cssUtils: makeCSSUtils(),
  },
  globalStyles: () => ({
    "html, body": {
      padding: 0,
      margin: 0,
      // backgroundColor: theme.colors.primary[5],

      backgroundColor: "transparent",
      overflow: "hidden",
      height: "100%",
      // background: "red",
    },

    "#root": {
      padding: 25,
      boxSizing: "border-box",
      // center content
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
      height: "100%",
    },

    // scrollbars css classnames
    "::-webkit-scrollbar": {},
  }),
  fontFamily: "RobotoMono, monospace",
  components: {
    Text: {
      defaultProps: {
        ff: "RobotoMono, monospace",
        color: "primary.1",
      },
    },
    Kbd: {
      defaultProps: {
        ff: "RobotoMono, monospace",
        sx: (theme: MantineTheme) => ({
          backgroundColor: theme.colors.primary[4],
          borderColor: theme.colors.primary[3],
          color: theme.colors.primary[1],
        }),
      },
    },
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider theme={overrideTheme} withGlobalStyles withNormalizeCSS>
      {children}
    </MantineProvider>
  );
};
