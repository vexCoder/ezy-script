import { ErrorFallback } from "@components/Utils";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@utils/redux.helper";
import { Notifications } from "@mantine/notifications";
import { TRPCProvider } from "./TRPC";
import { ThemeProvider } from "./Theme";

export type MainProviderProps = {
  children: ReactChildren;
};

export const MainProvider = ({ children }: MainProviderProps) => {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <Provider store={store}>
        <TRPCProvider>
          <ThemeProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Notifications />
              <HashRouter>{children}</HashRouter>
            </ErrorBoundary>
          </ThemeProvider>
        </TRPCProvider>
      </Provider>
    </Suspense>
  );
};
