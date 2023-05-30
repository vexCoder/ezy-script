import {
  ActionIcon,
  Divider,
  Flex,
  Group,
  Kbd,
  Popover,
  Text,
  Loader,
  MantineNumberSize,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  createReactComponent,
  IconArrowBackUp,
  IconDeviceFloppy,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { Siprettier } from "@icons-pack/react-simple-icons";
import { Fragment } from "react";
import { useAppSelector } from "@hooks/redux";
import { ActionKeys, ActionState } from "@slices/editor";

const IconFolderSearch = createReactComponent(
  "folder-search",
  "IconFolderSearch",
  [
    [
      "path",
      {
        d: "M11 19h-6a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2.5",
        key: "svg-0",
      },
    ],
    ["path", { d: "M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", key: "svg-1" }],
    ["path", { d: "M20.2 20.2l1.8 1.8", key: "svg-2" }],
  ]
);

const Actions = () => {
  return (
    <Flex
      align="center"
      sx={(theme) => ({
        padding: theme.other.cssUtils.spacing("4px", "8px"),
        borderBottom: `1px solid ${theme.colors.primary[3]}`,
      })}
      gap="xs"
    >
      <ActionItem
        Icon={IconArrowBackUp}
        shortcut={["Ctrl", "Backspace"]}
        label="Return"
        actionKey="return"
      />
      <ActionItem
        Icon={IconFolderSearch}
        shortcut={["Ctrl", "Alt", "E"]}
        label="Open In Explorer"
        actionKey="open"
      />
      <ActionItem
        Icon={Siprettier}
        shortcut={["Ctrl", "Alt", "P"]}
        label="Toggle Prettier"
        actionKey="prettier"
        size="xs"
      />
      <Divider orientation="vertical" color="primary.3" size="sm" />
      <ActionItem
        Icon={IconDeviceFloppy}
        shortcut={["Ctrl", "S"]}
        label="Save"
        actionKey="save"
      />
      <ActionItem
        Icon={IconPlayerPlayFilled}
        shortcut={["Ctrl", "Alt", "S"]}
        label="Run & Save"
        actionKey="play"
      />
    </Flex>
  );
};

interface ActionItemProps {
  Icon: React.ElementType;
  shortcut: string[];
  label: string;
  actionKey: ActionKeys;
  size?: MantineNumberSize;
}

const ActionItem = ({
  Icon,
  shortcut,
  label,
  actionKey,
  size,
}: ActionItemProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const state = useAppSelector((state) => state.editor.action);

  if (state[actionKey] === ActionState.Loading)
    return <Loader color="primary.3" size="xs" variant="dots" />;

  return (
    <Popover position="bottom" withArrow shadow="md" opened={opened}>
      <Popover.Target>
        <ActionIcon
          variant="transparent"
          color="primary.1"
          size={size ?? "sm"}
          radius="sm"
          onMouseEnter={open}
          onMouseLeave={close}
          disabled={state[actionKey] === ActionState.Disabled}
          sx={(theme) => ({
            color:
              state[actionKey] === ActionState.Active
                ? theme.colors.secondary[3]
                : theme.colors.primary[1],
            "&[data-disabled]": {
              color: theme.colors.primary[3],
            },
          })}
        >
          <Icon />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown
        sx={(theme) => ({
          backgroundColor: theme.fn.rgba(theme.colors.primary[5], 0.9),
          borderColor: theme.colors.primary[3],
          padding: theme.other.cssUtils.spacing("8px", theme.spacing.xs),
          "& > div.mantine-Popover-arrow": {
            borderColor: theme.colors.primary[3],
          },
        })}
      >
        <Flex align="center" gap="xl" justify="space-between">
          <Text fz="xs">{label}</Text>
          <Group spacing={4}>
            {shortcut.map((key, i) => (
              <Fragment key={key}>
                {i > 0 && <Text fz="xs">+</Text>}
                <Kbd size="xs">{key}</Kbd>
              </Fragment>
            ))}
          </Group>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
};

export default Actions;
