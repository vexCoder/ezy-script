import {
  Button,
  createStyles,
  Group,
  InputBase,
  Kbd,
  px,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useElementSize, useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import isEqual from "fast-deep-equal/react";
import _ from "lodash";
import { Fragment, memo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useDeepCompareEffect } from "react-use";
import { useContainer } from "../../providers/Container";
import { RouterOutputs, trpc } from "../../utils/trpc.helper";

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.other.cssUtils.spacing(
      0,
      theme.fontSizes.xs,
      0,
      theme.fontSizes.xs
    ),
  },
  input: {
    backgroundColor: "transparent",
    outline: 0,
    border: "none",
    borderRadius: 0,
    fontSize: theme.fontSizes.xl,
    "&::placeholder": {
      color: theme.colors.primary[3],
      fontWeight: 600,
    },
    caretColor: theme.colors.primary[3],
    color: theme.colors.primary[1],
    height: "100%",
    lineHeight: 1,
  },
  inputContainer: {
    flex: "1 1 auto",
    height: "100%",
  },
}));

export const Navigator = memo(({}) => {
  const { classes, theme } = useStyles();
  const [search, setSearch] = useState("sample --filename test");
  const [value] = useDebouncedValue(search, 500);
  const { ref, height } = useElementSize();
  const { transform } = useContainer();

  trpc.scripts.makeItems.useQuery(value);
  const { data: script } = trpc.scripts.getScript.useQuery(value);
  const { data: items } = trpc.scripts.makeItems.useQuery(value, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  useDeepCompareEffect(() => {
    if (items?.length || script) {
      transform({
        custom: Math.ceil(height + 46 + 28 + px("0.625rem")),
      });
    } else {
      transform({
        size: "small",
      });
    }
  }, [height, items, script]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearch(value);
  };

  return (
    <>
      <Helmet>
        <title>Navigator</title>
      </Helmet>
      <Stack className={classes.container} spacing={0}>
        <Group
          align="center"
          spacing={0}
          style={{
            flex: "0 0 34px",
            width: "100%",
            padding: theme.other.cssUtils.spacing(0, theme.spacing.xs),
          }}
        >
          <IconSearch
            style={{ flex: "0 0 auto", color: theme.colors.primary[3] }}
          />
          <InputBase
            placeholder="Search..."
            classNames={{
              input: classes.input,
              wrapper: classes.inputContainer,
              root: classes.inputContainer,
            }}
            autoFocus
            onChange={handleChange}
          />
        </Group>
        <ScrollArea.Autosize>
          <Stack spacing={4} mt="xs">
            <div ref={ref}>
              {/** script details */}
              {!!script && (
                <Group
                  sx={(theme) => ({
                    padding: theme.other.cssUtils.spacing("4px", "6px"),
                  })}
                >
                  <Stack spacing={8}>
                    <Text fz="sm" color="primary.3">
                      {`${script.doc?.name} Doc`}
                    </Text>
                    {script.doc?.description && (
                      <Text fz="xs" ml="md" mb="xs" lh={1} color="primary.3">
                        {script.doc?.description}
                      </Text>
                    )}
                  </Stack>
                </Group>
              )}

              {!!script &&
                (script.doc?.parameters ?? []).map((v) => (
                  <Group
                    key={v.name}
                    align="flex-start"
                    sx={(theme) => ({
                      padding: theme.other.cssUtils.spacing("4px", "6px"),
                    })}
                  >
                    <Stack spacing={8} sx={{ flex: 1 }}>
                      <Text fz="xs" lh={1} color="primary.1">
                        {`--${v.name} {${v.type}}`}
                      </Text>
                      {v.description && (
                        <Text fz="xs" ml="md" lh={1} color="primary.3">
                          {v.description}
                        </Text>
                      )}
                    </Stack>
                    {v.name && script.parameters[v.name] && (
                      <Text
                        fz="xs"
                        ml="md"
                        pr="xs"
                        maw={200}
                        lineClamp={1}
                        color="secondary.3"
                        h="100%"
                      >
                        {script.parameters[v.name] ?? ""}
                      </Text>
                    )}
                  </Group>
                ))}
              {/** actions */}
              {items?.length && (
                <Group
                  mt="xs"
                  sx={(theme) => ({
                    padding: theme.other.cssUtils.spacing("4px", "6px"),
                  })}
                >
                  <Text fz="sm" color="primary.3">
                    Actions
                  </Text>
                </Group>
              )}
              {(items ?? []).map((item) => (
                <NavItem
                  item={item}
                  key={item.command}
                  script={script}
                  input={value}
                />
              ))}
              {/** others */}
            </div>
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </>
  );
}, isEqual);

type Item = RouterOutputs["scripts"]["makeItems"][number];
interface NavItemProps {
  item: Item;
  script?: RouterOutputs["scripts"]["getScript"];
  input?: string;
}

const useItemStyles = createStyles((theme) => ({
  container: {
    padding: theme.other.cssUtils.spacing("4px", "6px"),
    borderRadius: theme.radius.sm,
    // border: `1px solid ${theme.colors.primary[1]}`,
    // boxShadow: theme.shadows.xs,
    background: "transparent",
    width: "100%",
    height: "100%",

    "&:hover": {
      background: theme.colors.primary[6],
    },
  },
  label: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    "& > *:first-of-type": {
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

const NavItem = ({ item, script, input }: NavItemProps) => {
  const { classes } = useItemStyles();
  const ref = useRef<HTMLButtonElement>(null);
  const [disabled, setDisabled] = useState(false);

  const { mutateAsync: runScript } = trpc.scripts.runScript.useMutation();
  const { mutateAsync: resyncScript } = trpc.scripts.resyncScript.useMutation();

  useHotkeys([[item.keys.join("+"), () => ref.current?.click()]]);

  const navigate = useNavigate();

  const handleClick = async () => {
    setDisabled(true);
    const scriptId = script?.id;
    if (item.command === "script.edit" && script && script.id) {
      await resyncScript(script.id);
      navigate(`/editor/${script.id}`, { replace: true });
    }

    if (item.command === "script.run" && scriptId && input) {
      await runScript({
        input,
        script: scriptId,
      });
    }
    setDisabled(false);
  };

  return (
    <Button
      ref={ref}
      className={classes.container}
      classNames={{ label: classes.label }}
      onClick={handleClick}
      disabled={disabled}
      sx={() => ({
        "&[data-disabled]": { opacity: 0.4, background: "transparent" },
      })}
    >
      <Group>
        <Stack spacing={4} sx={{ flex: 1 }}>
          <Text fz="xs" fw={600} className={classes.title}>
            {_.capitalize(item.label)}
          </Text>
        </Stack>

        <Group spacing={4}>
          {item.keys.map((v, i) => (
            <Fragment key={v}>
              <Kbd size="xs">{v}</Kbd>
              <Text fz="xs" fw={600} className={classes.title}>
                {i !== item.keys.length - 1 && " + "}
              </Text>
            </Fragment>
          ))}
        </Group>
      </Group>

      {/* <Stack spacing={4}>
        <Text fz="sm" className={classes.description}>
          {script.filesize.toFixed(2)}kb
        </Text>
        <Text fz="sm" className={classes.description}>
          {dayjs(script.createdAt).format("DD/MM/YYYY hh:mm a")}
        </Text>
        <Text fz="sm" className={classes.description}>
          {dayjs(script.updatedAt).format("DD/MM/YYYY hh:mm a")}
        </Text>
      </Stack> */}
    </Button>
  );
};
