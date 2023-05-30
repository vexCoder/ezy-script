import {
  Stack,
  Flex,
  Text,
  createStyles,
  Menu,
  ScrollArea,
  UnstyledButton,
  InputBase,
  ActionIcon,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useDebounce, useMount, useToggle } from "react-use";
import { RouterInputs, RouterOutputs, trpc } from "../../../utils/trpc.helper";

type Lib = Exclude<
  Exclude<RouterOutputs["scripts"]["getScript"], null>["libraries"],
  undefined
>[number];

type PackagesProps = {
  libs?: Lib[];
  script?: RouterOutputs["scripts"]["getScriptById"];
};

const useStyles = createStyles((theme) => ({
  root: {
    flex: "0 0 225px",
    borderRight: `1px solid ${theme.colors.primary[3]}`,
  },
  item: {
    height: "auto",
    padding: theme.other.cssUtils.spacing(0, theme.spacing.xs),
  },
  dropdown: {
    background: theme.colors.primary[5],
    borderColor: theme.colors.primary[3],
    minHeight: 0,
  },
  button: {
    border: "1px solid transparent",
    padding: `4px 4px`,
    color: theme.colors.primary[1],
    flex: 1,
    height: "auto",
    backgroundColor: "transparent",
    borderRadius: theme.radius.sm,
    "&:hover": {
      border: `1px solid ${theme.colors.primary[3]}`,
      transition: "all 0.2s ease-in-out",
    },
  },
  iconButton: {
    border: "1px solid transparent",
    borderRadius: theme.radius.sm,
    width: 28,
    height: "100%",
    "&:hover": {
      border: `1px solid ${theme.colors.primary[3]}`,
      transition: "all 0.2s ease-in-out",
      background: "transparent",
    },
  },
  dropdownInput: {
    height: "auto",
    minHeight: 0,
    lineHeight: 1,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary[1],
    padding: 0,
    fontWeight: 600,
    "::placeholder": {
      color: theme.colors.primary[3],
      opacity: 1,
    },
  },
  dropdownLabel: {
    color: theme.colors.primary[3],
  },
  addButton: {
    border: `2px dashed ${theme.colors.primary[3]}`,
    padding: `4px 4px`,
    color: theme.colors.primary[1],
    margin: theme.other.cssUtils.spacing(0, theme.spacing.xs),
    borderRadius: theme.radius.sm,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
}));

export const Packages = ({ libs, script }: PackagesProps) => {
  const { classes, theme } = useStyles();
  const [add, toggleAdd] = useToggle(false);

  return (
    <Stack className={classes.root} spacing={0}>
      <Text
        fz="xs"
        fw="bolder"
        sx={{
          padding: theme.other.cssUtils.spacing("4px", theme.spacing.xs),
        }}
        color="primary.1"
      >
        Packages
      </Text>
      {(libs ?? []).map((lib) => (
        <PackageItem key={lib.id} lib={lib} />
      ))}
      {add && (
        <PackageItem
          lib={{}}
          scriptId={script?.id}
          defaultOpened
          onSave={() => {
            toggleAdd(false);
          }}
          onRemove={() => {
            toggleAdd(false);
          }}
        />
      )}
      {!add && (
        <UnstyledButton
          className={classes.addButton}
          onClick={() => toggleAdd(true)}
        >
          <Text fz="xs">Add Package</Text>
        </UnstyledButton>
      )}
    </Stack>
  );
};

interface PackageItemProps {
  lib: Lib | Partial<Lib>;
  scriptId?: number;
  defaultOpened?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
}

export const PackageItem = ({
  lib,
  scriptId,
  defaultOpened,
  onSave,
  onRemove,
}: PackageItemProps) => {
  const { classes, theme } = useStyles();
  const [packageSearch, setPackageSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data = [] } = trpc.npm.getVersions.useQuery(lib.name || "");
  const { data: packageData = [] } = trpc.npm.searchNPM.useQuery(
    debouncedSearch,
    {
      enabled: debouncedSearch.length >= 3,
    }
  );
  const updateLib = trpc.scripts.updateLib.useMutation();
  const deleteLib = trpc.scripts.deleteLib.useMutation();

  const ctx = trpc.useContext();

  type UpdateData = RouterInputs["scripts"]["updateLib"];

  useDebounce(
    () => {
      setDebouncedSearch(packageSearch);
    },
    500,
    [packageSearch]
  );

  const handleChange = (value: string) => {
    setPackageSearch(value);
  };

  const handleUpdate = async (value: Partial<UpdateData>) => {
    const name = value.name || lib.name;
    const version = value.version || lib.version;

    if (!name || !version) return;

    await updateLib.mutateAsync({
      id: lib.id,
      name,
      version,
      script: scriptId,
    });

    ctx.scripts.getScript.invalidate();
    ctx.scripts.getScriptById.invalidate(scriptId);

    onSave?.();
  };

  const handleDelete = async () => {
    onRemove?.();
    if (!lib.id) return;

    await deleteLib.mutateAsync(lib.id);

    ctx.scripts.getScript.invalidate();
    ctx.scripts.getScriptById.invalidate(scriptId);
  };

  return (
    <Flex
      gap={theme.spacing.xs}
      className={classes.item}
      direction="row"
      wrap="nowrap"
      w="100%"
      align="center"
    >
      <PackageItemDropdown
        name={lib.name}
        options={packageData}
        label="Search Package"
        inputValue={packageSearch}
        onInputChange={handleChange}
        renderLabel={(val) => val.name}
        defaultOpened={defaultOpened}
        onSelect={(val) => {
          handleUpdate({
            name: val.name,
            version: val.version,
          });
        }}
      />
      <PackageItemDropdown
        name={lib.version}
        options={data}
        label="Select Version"
        onSelect={(val) => {
          handleUpdate({
            version: val,
          });
        }}
      />
      <ActionIcon
        size="xs"
        color="red.5"
        className={classes.iconButton}
        variant="outline"
        onClick={handleDelete}
      >
        <IconTrash size="14px" />
      </ActionIcon>
    </Flex>
  );
};

interface PackageItemVersionProps<T> {
  name: string | React.ReactNode;
  options: T[];
  label: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSelect?: (value: T) => void;
  renderLabel?: (value: T) => string;
  align?: "left" | "center" | "right";
  defaultOpened?: boolean;
}

export const PackageItemDropdown = <T,>({
  name,
  options,
  label,
  inputValue,
  onInputChange,
  onSelect,
  renderLabel,
  align = "left",
  defaultOpened,
}: PackageItemVersionProps<T>) => {
  const { classes, theme } = useStyles();
  const dropdownInputRef = useRef<HTMLInputElement>(null);

  useMount(() => {
    if (defaultOpened) {
      setTimeout(() => {
        dropdownInputRef.current?.focus();
      }, 100);
    }
  });

  return (
    <Menu
      shadow="md"
      width={200}
      position="right-start"
      transitionProps={{
        transition: "fade",
      }}
      classNames={{
        dropdown: classes.dropdown,
      }}
      defaultOpened={defaultOpened}
      onOpen={() => {
        if (onInputChange) {
          setTimeout(() => {
            dropdownInputRef.current?.focus();
          }, 100);
        }
      }}
    >
      <Menu.Target>
        <UnstyledButton variant="outline" className={classes.button}>
          <Text
            fz="xs"
            align={align}
            color={name ? "primary.1" : "primary.3"}
            style={{ flex: 1 }}
          >
            {name || "n/a"}
          </Text>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown}>
        <ScrollArea.Autosize mah={200}>
          {!onInputChange && (
            <>
              <Menu.Label
                sx={{ lineClamp: 1 }}
                lh={1}
                style={{ color: theme.colors.primary[3] }}
              >
                {label}
              </Menu.Label>
              <Menu.Divider style={{ borderColor: theme.colors.primary[3] }} />
            </>
          )}

          {onInputChange && (
            <>
              <Menu.Label>
                <InputBase
                  style={{
                    color: theme.colors.primary[1],
                    padding: 0,
                  }}
                  classNames={{
                    input: classes.dropdownInput,
                    label: classes.dropdownLabel,
                  }}
                  autoFocus
                  placeholder={label}
                  variant="unstyled"
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  ref={dropdownInputRef}
                />
              </Menu.Label>
              <Menu.Divider style={{ borderColor: theme.colors.primary[3] }} />
            </>
          )}
          {options.map((opt) => {
            const label = (renderLabel?.(opt) ?? opt) as string;
            return (
              <Menu.Item
                style={{ color: theme.colors.primary[1] }}
                key={label}
                onClick={() => {
                  onSelect?.(opt);
                }}
              >
                {label}
              </Menu.Item>
            );
          })}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
};
