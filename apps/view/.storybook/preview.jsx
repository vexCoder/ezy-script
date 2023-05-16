import { Provider } from "react-redux";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { store } from "../src/utils/redux.helper";
import { ThemeProvider } from "../src/providers/Theme";
import { ToastProvider } from "../src/providers/Toast";
import React from "react";

const VIEWPORTS = {
  m1: {
    name: "m1",
    styles: {
      height: "640px",
      width: "360px",
    },
  },
  sm: {
    name: "sm",
    styles: {
      width: "640px",
      height: "360px",
    },
  },
  md: {
    name: "md",
    styles: {
      width: "768px",
      height: "432px",
    },
  },
  lg: {
    name: "lg",
    styles: {
      width: "1024px",
      height: "576px",
    },
  },
  xl: {
    name: "xl",
    styles: {
      width: "1280px",
      height: "720px",
    },
  },
  "2xl": {
    name: "2xl",
    styles: {
      width: "1536px",
      height: "864px",
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: VIEWPORTS,
    defaultViewport: "lg",
  },
};

const queryClient = new QueryClient({});

export const decorators = [
  (story) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <HashRouter>{story()}</HashRouter>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  ),
];

window.public = {
  getStaffName: async (id) => {
    return `Firstname Lastname`;
  },
};

window.React = React;
