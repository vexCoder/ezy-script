import { Flex } from "@mantine/core";
import { Navigate, useParams } from "react-router-dom";
import { trpc } from "../../../utils/trpc.helper";
import { Code } from "../components";
import { Packages } from "../components/Packages";

export const Editor = ({}) => {
  const { script } = useParams<{ script: string }>();

  const id = parseInt(script || "", 10);
  const { data, isFetching } = trpc.scripts.getScript.useQuery(id);
  const { data: libData } = trpc.scripts.getTypescriptLibs.useQuery(id);
  const save = trpc.scripts.saveCode.useMutation();

  if (!data && !isFetching) return <Navigate to="/navigator" />;

  if (!data) return null;

  const handleSave = async (value: string) => {
    await save.mutateAsync({ id, code: value });
  };

  return (
    <Flex direction="row" style={{ height: "100%" }}>
      <Packages libs={data.libraries} />
      <Code value={data.value || ""} libs={libData || []} onSave={handleSave} />
    </Flex>
  );
};
