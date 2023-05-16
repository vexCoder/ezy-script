import {
  Stack,
  Flex,
  Text,
  createStyles,
  Menu,
  ScrollArea,
  UnstyledButton,
  InputBase,
} from "@mantine/core";
import { useState } from "react";
import { useDebounce } from "react-use";
import { RouterInputs, RouterOutputs, trpc } from "../../../utils/trpc.helper";

type Lib = Exclude<
  Exclude<RouterOutputs["scripts"]["getScript"], null>["libraries"],
  undefined
>[number];

type PackagesProps = {
  libs?: Lib[];
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.primary[5],
    flex: "0 0 200px",
    borderRight: `1px solid ${theme.colors.primary[3]}`,
  },
  item: {
    height: "auto",
    padding: 4,
  },
  dropdown: {
    background: theme.colors.primary[5],
    borderColor: theme.colors.primary[3],
    minHeight: 0,
  },
  button: {
    border: "1px solid transparent",
    padding: `4px ${theme.spacing.xs}`,
    color: theme.colors.primary[1],
    flex: 1,
    height: "auto",
    backgroundColor: theme.colors.primary[5],
    borderRadius: theme.radius.sm,
    "&:hover": {
      border: `1px solid ${theme.colors.primary[3]}`,
      transition: "all 0.2s ease-in-out",
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
}));

export const Packages = ({ libs }: PackagesProps) => {
  const { classes } = useStyles();
  return (
    <Stack className={classes.root} spacing={0}>
      {(libs ?? []).map((lib) => (
        <PackageItem key={lib.id} lib={lib} />
      ))}
    </Stack>
  );
};

interface PackageItemProps {
  lib: Lib;
}

export const PackageItem = ({ lib }: PackageItemProps) => {
  const { classes, theme } = useStyles();
  const [packageSearch, setPackageSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data = [] } = trpc.npm.getVersions.useQuery(lib.name);
  const { data: packageData = [] } = trpc.npm.searchNPM.useQuery(
    debouncedSearch,
    {
      enabled: debouncedSearch.length >= 3,
    }
  );
  const updateLib = trpc.scripts.updateLib.useMutation();

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
    await updateLib.mutateAsync({
      id: lib.id,
      name: lib.name,
      version: lib.version,
      ...value,
    });

    ctx.scripts.getScript.invalidate();
  };

  return (
    <Flex
      gap={theme.spacing.xs}
      className={classes.item}
      direction="row"
      wrap="nowrap"
      w="100%"
    >
      <PackageItemDropdown
        name={lib.name}
        options={packageData}
        label="Search Package"
        inputValue={packageSearch}
        onInputChange={handleChange}
        renderLabel={(val) => val.name}
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
        align="center"
        onSelect={(val) => {
          handleUpdate({
            version: val,
          });
        }}
      />
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
}: PackageItemVersionProps<T>) => {
  const { classes, theme } = useStyles();

  return (
    <Menu
      shadow="md"
      width={200}
      position="top-start"
      transitionProps={{
        transition: "fade",
      }}
      classNames={{
        dropdown: classes.dropdown,
      }}
    >
      <Menu.Target>
        <UnstyledButton variant="outline" className={classes.button}>
          <Text fz="xs" align={align} style={{ flex: 1 }}>
            {name}
          </Text>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className={classes.dropdown}>
        <ScrollArea.Autosize mah={200}>
          {!onInputChange && (
            <>
              <Menu.Label style={{ color: theme.colors.primary[3] }}>
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
