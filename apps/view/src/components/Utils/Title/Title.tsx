import { Group, createStyles, ActionIcon, Text, Flex } from "@mantine/core";
import {
  IconBoxMultiple,
  IconMaximize,
  IconMinus,
  IconX,
} from "@tabler/icons-react";
import { useLocation } from "react-router-dom";
import { trpc } from "../../../utils/trpc.helper";

const useStyles = createStyles((theme) => ({
  container: {
    position: "sticky",
    top: 0,
    width: "100%",
    zIndex: 100,
    backgroundColor: theme.colors.primary[5],
    borderBottom: `1px solid ${theme.colors.primary[3]}`,
  },
  dragger: {
    flex: 1,
    backgroundColor: "transparent",
    "-webkit-app-region": "drag",
    zIndex: 50,
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
}));

type Props = {};
export const Title = ({}: Props) => {
  const { classes } = useStyles();
  const { pathname } = useLocation();

  const { data: isMaximized } = trpc.windows.isMaximized.useQuery();
  const toggleWindow = trpc.windows.toggleWindow.useMutation();
  const ctx = trpc.useContext();

  return (
    <Flex className={classes.container} gap={0}>
      <div className={classes.dragger} />
      <Text fz="xs" className={classes.title}>
        {/* {document.title} */}
        {pathname}
      </Text>
      <Group spacing="xs" className={classes.actions}>
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
      </Group>
    </Flex>
  );
};
