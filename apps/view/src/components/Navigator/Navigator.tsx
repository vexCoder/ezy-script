import { Stack, createStyles, Text, Button } from "@mantine/core";
import dayjs from "dayjs";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { RouterOutputs, trpc } from "../../utils/trpc.helper";

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.fontSizes.xs,
  },
}));

export const Navigator = () => {
  const { classes } = useStyles();
  const { data: scripts } = trpc.scripts.getScripts.useQuery();
  const navigate = useNavigate();
  const resync = trpc.scripts.resyncScript.useMutation();

  const handleClick = async (script: number) => {
    await resync.mutateAsync(script, {
      onSuccess: () => {
        navigate(`/editor/${script}`, { replace: true });
      },
    });
  };

  return (
    <Stack className={classes.container}>
      {scripts?.map((script) => (
        <Item script={script} onClick={handleClick} />
      ))}
    </Stack>
  );
};

interface ItemProps {
  script: RouterOutputs["scripts"]["getScripts"][number];
  onClick?: (script: number) => void;
}

const useItemStyles = createStyles((theme) => ({
  container: {
    padding: theme.fontSizes.xs,
    border: `1px solid ${theme.colors.primary[1]}`,
    borderRadius: theme.radius.sm,
    boxShadow: theme.shadows.xs,
    width: "100%",
    height: "100%",
  },
  label: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > *:first-child": {
      flex: 1,
    },
  },
  title: {
    color: theme.colors.primary[1],
    lineHeight: 1,
  },
  description: {
    color: theme.colors.primary[3],
    lineHeight: 1,
  },
}));

const Item = ({ script, onClick }: ItemProps) => {
  const { classes } = useItemStyles();
  return (
    <Button
      className={classes.container}
      classNames={{ label: classes.label }}
      onClick={() => {
        onClick?.(script.id);
      }}
    >
      <Stack spacing={4}>
        <Text fz="xl" fw={600} className={classes.title}>
          {_.capitalize(script.name)}
        </Text>
        <Text fz="sm" className={classes.description}>
          {script.description || "n/a"}
        </Text>
      </Stack>

      <Stack spacing={4}>
        <Text fz="sm" className={classes.description}>
          {script.filesize.toFixed(2)}kb
        </Text>
        <Text fz="sm" className={classes.description}>
          {dayjs(script.createdAt).format("DD/MM/YYYY hh:mm a")}
        </Text>
        <Text fz="sm" className={classes.description}>
          {dayjs(script.updatedAt).format("DD/MM/YYYY hh:mm a")}
        </Text>
      </Stack>
    </Button>
  );
};
