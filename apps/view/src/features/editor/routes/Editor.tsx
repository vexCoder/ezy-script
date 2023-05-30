import { Flex } from "@mantine/core";
import { Helmet } from "react-helmet";
import { Navigate, useParams } from "react-router-dom";
import { useDeepCompareEffect } from "react-use";
import dayjs from "dayjs";
import { useAppDispatch } from "../../../hooks";
import { useContainer } from "../../../providers/Container";
import { ActionState, setActionState } from "../../../slices/editor";
import { trpc } from "../../../utils/trpc.helper";
import { CodeV2 } from "../components";
import Actions from "../components/Actions";
import { Packages } from "../components/Packages";
import Terminal from "../components/Terminal";

export const Editor = ({}) => {
  const { script } = useParams<{ script: string }>();
  const { transform } = useContainer();
  const dispatch = useAppDispatch();

  const id = parseInt(script || "", 10);

  const { data, isFetching } = trpc.scripts.getScriptById.useQuery(id, {
    networkMode: "online",
    cacheTime: 0,
    staleTime: 0,
  });

  const { data: libData } = trpc.scripts.getTypescriptLibs.useQuery(id);
  const save = trpc.scripts.saveCode.useMutation();
  const { data: currentWindow } = trpc.windows.currentWindow.useQuery();
  const { mutateAsync: runScript } = trpc.scripts.runScript.useMutation();
  const ctx = trpc.useContext();

  useDeepCompareEffect(() => {
    if (currentWindow) {
      transform({
        size: "large",
        width: (currentWindow.width ?? 0) * 0.6,
      });
    }
  }, [currentWindow]);

  if (!data && !isFetching) return <Navigate to="/navigator" />;

  if (!data) return null;

  const handleSave = async (value: string) => {
    await save.mutateAsync({ id, code: value });

    dispatch(
      setActionState({
        action: "save",
        state: ActionState.Disabled,
      })
    );

    await ctx.scripts.getScriptById.invalidate(id);
    await ctx.scripts.getScriptById.refetch(id);
  };

  const handleSaveRun = async (value: string, input: string) => {
    await save.mutateAsync({ id, code: value });

    dispatch(
      setActionState({
        action: "save",
        state: ActionState.Disabled,
      })
    );

    await runScript({
      input,
      script: id,
    });

    await ctx.scripts.getScriptById.invalidate(id);
    await ctx.scripts.getScriptById.refetch(id);
  };

  return (
    <>
      <Helmet>
        <title>{`Script: ${data.name}`}</title>
      </Helmet>
      <Flex
        direction="row"
        sx={(theme) => ({
          height: "100%",
          overflow: "hidden",
          borderTop: `1px solid ${theme.colors.primary[3]}`,
        })}
      >
        <Packages libs={data.libraries} script={data} />
        <Flex
          direction="column"
          sx={{
            width: "100%",
          }}
        >
          <Actions />
          <CodeV2
            value={data.value || ""}
            libs={libData || []}
            onSave={handleSave}
            onRun={handleSaveRun}
            version={dayjs(data.updatedAt).unix()}
          />
          <Terminal script={data.id!} />
        </Flex>
      </Flex>
    </>
  );
};
