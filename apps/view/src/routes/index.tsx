import Editor from "@features/editor";
import { Navigate, useRoutes } from "react-router-dom";
import { Navigator } from "@components/Navigator";
import { Stack } from "@mantine/core";
import { Title } from "@components/Utils";

export const AppRoutes = () => {
  const common = [
    {
      path: "editor/*",
      element: <Editor />,
    },
    {
      path: "navigator/*",
      element: <Navigator />,
    },
    {
      path: "*",
      element: <Navigate to="/navigator" />,
    },
  ];

  const element = useRoutes([...common]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <Stack style={{ height: "100vh" }} spacing={0}>
      <Title />
      <div style={{ height: `calc(100vh - 32px)` }}>{element}</div>
    </Stack>
  );
};
