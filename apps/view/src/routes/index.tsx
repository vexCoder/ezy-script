import { Navigator } from "@components/Navigator";
import { Title } from "@components/Utils";
import Editor from "@features/editor";
import { Stack, useMantineTheme } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import { useMount, useToggle } from "react-use";
import { trpc } from "../utils/trpc.helper";

export const AppRoutes = () => {
  const common = [
    {
      path: "/",
      element: <Container />,
      children: [
        {
          path: "editor/*",
          element: <Editor />,
        },
        {
          path: "navigator/*",
          element: <Navigator />,
        },
        // {
        //   path: "",
        //   element: <Navigate to="/navigator" />,
        // },
        {
          path: "",
          element: <Navigate to="/editor/1" />,
        },
      ],
    },
  ];

  const element = useRoutes([...common]);

  return element;
};

const Container = () => {
  const { ref, height } = useElementSize();
  const theme = useMantineTheme();
  const [hide, toggleHide] = useToggle(true);
  const [, toggleMounted] = useToggle(false);

  const toggleVisibility = trpc.windows.toggleVisibility.useMutation();
  const bringToFront = trpc.windows.bringToFront.useMutation();

  trpc.windows.onToggleVisibility.useSubscription(undefined, {
    onData: (opts) => {
      toggleHide(opts === "hide");

      setTimeout(
        () => {
          toggleVisibility.mutateAsync(opts);
          if (opts === "show") bringToFront.mutateAsync();
        },
        opts === "hide" ? 500 : 0
      );
    },
  });

  // trpc.windows.onUnFocus.useSubscription(undefined, {
  //   onData: () => {
  //     if (hide) return;
  //     toggleHide(true);

  //     setTimeout(() => {
  //       toggleVisibility.mutateAsync("hide");
  //     }, 500);
  //   },
  // });

  useMount(() => {
    toggleHide(false);
    toggleMounted(true);
  });

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          key="container"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformOrigin: "top left",
          }}
          initial={{ opacity: 0, y: -10 }}
          // animate={{ opacity: 1, y: 0, height: size.height - 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            delay: 0.2,
            opacity: { duration: 0.3, type: "tween" },
            y: { duration: 0.2, type: "tween" },
            // height: { duration: 0.25, delay: 0 },
          }}
        >
          <Stack
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.fn.rgba(theme.colors.primary[5], 0.95),
              boxShadow: theme.shadows.sm,
              borderBottom: `4px solid ${theme.colors.primary[6]}`,
              width: "100%",
              height: "100%",
            }}
            spacing={0}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            />
            <Title ref={ref} />
            <div
              style={{
                position: "relative",
                height: `calc(100vh - ${height}px)`,
                zIndex: 10,
              }}
            >
              <Outlet />
            </div>
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
