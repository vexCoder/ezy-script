import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@utils/query.helper";
import { trpc } from "@utils/trpc.helper";
import { ipcLink } from "electron-trpc/renderer";
import React, { useState } from "react";

interface TRPCProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

export const TRPCProvider = ({ children }: TRPCProviderProps) => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [ipcLink()],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
