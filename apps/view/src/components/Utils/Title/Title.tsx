import { ActionIcon, createStyles, Flex, Group, Text } from "@mantine/core";
import {
  IconBoxMultiple,
  IconMaximize,
  IconMinus,
  IconX,
} from "@tabler/icons-react";
import { Helmet } from "react-helmet";
import { forwardRef, useState } from "react";
import { trpc } from "../../../utils/trpc.helper";

const useStyles = createStyles((theme) => ({
  container: {
    position: "relative",
    width: "100%",
    zIndex: 100,
    // borderBottom: `1px solid ${theme.colors.primary[3]}`,
    padding: theme.other.cssUtils.spacing(0, 0, 0, theme.spacing.xs),
    minHeight: 28,
  },
  dragger: {
    flex: 1,
    backgroundColor: "transparent",
    WebkitAppRegion: "drag",
    zIndex: 50,
    height: "100%",
    left: 0,
  },
  title: {
    margin: 0,
    lineHeight: 1,
    color: theme.colors.primary[1],
    ...theme.other.cssUtils.center(),
  },
  actions: {
    position: "relative",
    padding: 2,
    width: "fit-content",
    zIndex: 120,
  },
  button: {
    "& > *": {
      color: theme.colors.primary[1],
      width: theme.fontSizes.sm,
      height: theme.fontSizes.sm,
    },
  },
  appName: {
    zIndex: 0,
    color: theme.colors.primary[1],
    margin: 0,
    flex: "0 0 auto",
    userSelect: "none",
    pointerEvents: "none",
    position: "absolute",
    top: "calc(50% + 0.5px)",
    transform: "translateY(-50%)",
  },
}));

export const Title = forwardRef<HTMLDivElement>((_, ref) => {
  const { classes } = useStyles();
  const [title, setTitle] = useState(document.title);

  const { data: isMaximized } = trpc.windows.isMaximized.useQuery();
  const toggleWindow = trpc.windows.toggleWindow.useMutation();
  const ctx = trpc.useContext();

  return (
    <>
      <Helmet
        onChangeClientState={(doc) => {
          setTitle(doc.title);
        }}
      />
      <Flex ref={ref} align="center" className={classes.container} gap={0}>
        <div className={classes.dragger} />
        <Text fz="xs" weight={800} className={classes.appName}>
          EZY
        </Text>
        <Text fz="xs" className={classes.title}>
          {title}
        </Text>
        {/* <Group spacing="xs" className={classes.actions}>
          <ActionIcon
            color="primary"
            className={classes.button}
            variant="outline"
            type="button"
            onClick={() => {
              toggleWindow.mutate("minimize");
            }}
          >
            <IconMinus />
          </ActionIcon>
          <ActionIcon
            color="primary"
            className={classes.button}
            variant="outline"
            type="button"
            onClick={() => {
              toggleWindow.mutate(isMaximized ? "restore" : "maximize", {
                onSuccess: () => {
                  ctx.windows.isMaximized.invalidate();
                },
              });
            }}
          >
            {isMaximized ? <IconBoxMultiple /> : <IconMaximize />}
          </ActionIcon>
          <ActionIcon
            color="primary"
            className={classes.button}
            variant="outline"
            type="button"
            onClick={() => {
              toggleWindow.mutate("close");
            }}
          >
            <IconX />
          </ActionIcon>
        </Group> */}
      </Flex>
    </>
  );
});
