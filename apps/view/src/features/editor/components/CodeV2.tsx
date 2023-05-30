/* eslint-disable import/no-absolute-path */
import MonacoEditor from "@monaco-editor/react";
import Monaco from "monaco-editor";
import { wireTmGrammars } from "monaco-editor-textmate";
import { Registry } from "monaco-textmate";
import { loadWASM } from "onigasm";
import { useEffect, useState } from "react";
import { useDeepCompareEffect, useEffectOnce } from "react-use";
import { createStyles } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
// @ts-ignore
import wasm from "onigasm/lib/onigasm.wasm";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks";
import { useContainer } from "../../../providers/Container";
import { ActionState, setActionState } from "../../../slices/editor";
import json from "../utils/vs-conv.json";

type EditorType = Monaco.editor.IStandaloneCodeEditor;
type MonacoType = typeof Monaco;

type CodeV2Props = {
  value: string;
  onSave?: (value: string) => Promise<void>;
  onRun?: (value: string, input: string) => Promise<void>;
  libs?: { content: string; path: string }[];
  version?: number;
};

const useStyles = createStyles(() => ({
  root: {
    "& > .monaco-editor > .overflow-guard > .monaco-scrollable-element > .scrollbar.vertical ":
      {
        "& > .slider": {
          width: `8px !important`,
          borderRadius: "9999em",
          left: "3px !important",
        },
      },
  },
}));

export const CodeV2 = ({
  value,
  onSave,
  onRun,
  libs,
  version,
}: CodeV2Props) => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const [monaco, setMonaco] = useState<MonacoType>();
  const navigate = useNavigate();
  const { transform } = useContainer();
  const update = useForceUpdate();
  const [codeToDisplay, setCodeToDisplay] = useState(value);

  useEffectOnce(() => {
    loadWASM(wasm);
  });

  useEffect(() => {
    update();
    setCodeToDisplay(value);
  }, [version, update, value]);

  const handleEditorDidMount = async (
    editor: EditorType,
    monaco: MonacoType
  ) => {
    const plist = await fetch("/tmLanguage.plist?inline").then((res) =>
      res.text()
    );

    const registry = new Registry({
      getGrammarDefinition: async () => {
        return {
          format: "plist",
          content: plist,
        };
      },
    });

    const grammars = new Map();
    grammars.set("typescript", "source.ts");

    const compilerOptions =
      monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...compilerOptions,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      alwaysStrict: true,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      baseUrl: "file:///W:/Projects/ezy-script/temp/sample/",
      typeRoots: ["file:///node_modules/@types"],
    });

    monaco.editor.registerCommand(`editor.action.quickCommand`, () => {});

    monaco.editor.addEditorAction({
      id: "editor.action.save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      label: "Save",
      run: async () => {
        await onSave?.(editor.getValue());
        update();
      },
    });

    monaco.editor.addEditorAction({
      id: "editor.action.saveRun",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS,
      ],
      label: "Save & Run",
      run: async () => {
        await onRun?.(editor.getValue(), "");
        update();
      },
    });

    monaco.editor.addEditorAction({
      id: "editor.action.return",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace],
      label: "Return",
      run: () => {
        navigate("/navigator/");
        transform({
          size: "small",
        });
      },
    });

    const obj = json as any;

    monaco.editor.defineTheme("vs-code-theme-converted", {
      ...obj,
      colors: {
        ...obj.colors,
        "editor.background": "#00000000",
        "minimap.background": "#00000000",
        "editorOverviewRuler.background": "#00000000",
        "scrollbar.shadow": "#00000000",
        "editorOverviewRuler.border": "#00000000",
      },
    });

    monaco.editor.setTheme("vs-code-theme-converted");

    if (monaco && editor) {
      await wireTmGrammars(monaco, registry, grammars);
      setMonaco(monaco);
    }
  };

  useDeepCompareEffect(() => {
    if (monaco && libs?.length) {
      for (let i = 0; i < libs.length; i++) {
        const { path, content } = libs[i];
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          `ts:${path}`
        );
      }

      setMonaco(monaco);
    }
  }, [libs, monaco]);

  return (
    <MonacoEditor
      theme="vs-code-theme-converted"
      language="typescript"
      width="100%"
      value={codeToDisplay}
      onMount={handleEditorDidMount}
      className={classes.root}
      onChange={(newValue) => {
        if (newValue) {
          setCodeToDisplay(newValue);
        }

        if (value !== newValue) {
          dispatch(
            setActionState({
              action: "save",
              state: ActionState.Idle,
            })
          );
        }

        if (value === newValue) {
          dispatch(
            setActionState({
              action: "save",
              state: ActionState.Disabled,
            })
          );
        }
      }}
      options={{
        minimap: {
          scale: 1,
          enabled: true,
        },
      }}
    />
  );
};
