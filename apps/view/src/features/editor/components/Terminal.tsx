import { Stack, Box, createStyles, Text, Group } from "@mantine/core";
import dayjs from "dayjs";
import _ from "lodash";
import { useRef, useState } from "react";
import { ViewportList } from "react-viewport-list";
import { trpc } from "../../../utils/trpc.helper";

interface TerminalProps {
  script: number;
}

type Parsed = {
  category: "info" | "error" | "warn" | "debug" | "trace";
  args: any[];
  timestamp: number;
};

type Log = {
  id: number;
  category: Parsed["category"];
  message: string[];
  timestamp: number;
};

const useStyles = createStyles((theme) => ({
  line: {
    ".category": {
      flex: "0 0 50px",
      textTransform: "uppercase",
      "&.info": {
        color: theme.colors.blue[6],
      },
      "&.error": {
        color: theme.colors.red[6],
      },
      "&.warn": {
        color: theme.colors.yellow[6],
      },
      "&.debug": {
        color: theme.colors.green[6],
      },
      "&.trace": {
        color: theme.colors.gray[6],
      },
    },
    ".message": {
      flex: "1 1 auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      color: theme.colors.gray[6],
    },
    ".timestamp": {
      flex: "0 0 100px",
      textAlign: "right",
      color: theme.colors.green[6],
    },
  },
}));

const Terminal = ({ script }: TerminalProps) => {
  const { classes, cx } = useStyles();
  const ref = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  trpc.scripts.logs.useSubscription(script, {
    onData: (data) => {
      setLogs((prev) => {
        const newLogs = _.uniqBy([...prev, ...data.logs], "id");

        return newLogs;
      });

      setTimeout(() => {
        ref.current?.scrollTo({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        });
      }, 150);
    },
  });

  const parse = (message: any) => {
    if (typeof message === "string") {
      return message;
    }

    return JSON.stringify(message);
  };

  return (
    <Stack
      sx={(theme) => ({
        borderTop: `1px solid ${theme.colors.primary[3]}`,
      })}
      spacing={0}
    >
      <Text
        fz="xs"
        fw="bolder"
        sx={(theme) => ({
          padding: theme.other.cssUtils.spacing("4px", theme.spacing.xs),
        })}
        color="primary.1"
      >
        Logs
      </Text>
      <Box
        sx={(theme) => ({
          overflow: "auto",
          flex: "0 0 25vh",
          maxHeight: "25vh",
          padding: theme.other.cssUtils.spacing(
            0,
            theme.spacing.xs,
            theme.spacing.xs,
            theme.spacing.xs
          ),
        })}
        className="scroll-container"
        ref={ref}
      >
        <ViewportList viewportRef={ref} items={logs}>
          {(log) => (
            <Group
              className={classes.line}
              key={log.id}
              spacing={0}
              noWrap
              align="flex-start"
            >
              <Text className={cx("category", log.category)} fz="xs">
                {log.category}
              </Text>
              <Text className="message" fz="xs">
                {log.message.map(parse).join(" ")}
              </Text>
              <Text className="timestamp" fz="xs">
                {dayjs.unix(log.timestamp).format("HH:mm:ss")}
              </Text>
            </Group>
          )}
        </ViewportList>
      </Box>
    </Stack>
  );
};
export default Terminal;
