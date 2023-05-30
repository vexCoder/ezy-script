/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useContext, useState } from "react";
import { useMount } from "react-use";
import { RouterInputs, RouterOutputs, trpc } from "../utils/trpc.helper";

type ContainerAction = {
  transform: (
    opts: RouterInputs["windows"]["toggleWindowSize"],
    delay?: number
  ) => Promise<void>;
  size: RouterOutputs["windows"]["toggleWindowSize"];
};

type Props = {
  children: React.ReactNode | React.ReactNode[];
};

const ContainerContext = createContext<ContainerAction>({
  transform: async () => {},
  size: { width: 0, height: 0 },
});

const ContainerProvider = ({ children }: Props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const toggleWindowSize = trpc.windows.toggleWindowSize.useMutation();

  useMount(async () => {
    const res = await toggleWindowSize.mutateAsync({
      size: "small",
    });

    setSize(res);
  });

  return (
    <ContainerContext.Provider
      value={{
        transform: async (opts, delay = 0) => {
          setTimeout(async () => {
            await toggleWindowSize.mutateAsync(opts);
          }, delay);
        },
        size,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
};

const useContainer = () => {
  const context = useContext(ContainerContext);

  if (context === undefined) {
    throw new Error("useContainer must be used within a ContainerProvider");
  }

  return context;
};

export { ContainerProvider, useContainer };
