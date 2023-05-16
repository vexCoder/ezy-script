import { useMantineTheme } from "@mantine/styles";
import MonacoEditor from "@monaco-editor/react";
import Monaco from "monaco-editor";
import { useState } from "react";
import { useDeepCompareEffect } from "react-use";

type EditorType = Monaco.editor.IStandaloneCodeEditor;
type MonacoType = typeof Monaco;

interface CodeProps {
  value?: string;
  onSave?: (value: string) => void;
  libs?: { content: string; path: string }[];
}

export const Code = ({ value = "", onSave, libs = [] }: CodeProps) => {
  const [editor, setEditor] = useState<EditorType>();
  const [monaco, setMonaco] = useState<MonacoType>();
  const theme = useMantineTheme();

  const themeData: Monaco.editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: false,
    colors: {
      "editor.background": theme.colors.primary[5],
    },
    rules: [
      { token: "", foreground: "D4D4D4" },
      { token: "invalid", foreground: "ff3333" },
      {
        token: "type.identifier",
        fontStyle: "italic",
        foreground: theme.colors.teal[5],
      },
      {
        token: "keyword",
        foreground: theme.colors.secondary[0],
      },
      {
        token: "string",
        foreground: "#ce9178",
      },
      {
        token: "number",
        foreground: "#ce9178",
      },
    ],
  };

  const [selectedTheme, setSelectedTheme] = useState("vs-dark");

  const handleEditorDidMount = async (
    editor: EditorType,
    monaco: MonacoType
  ) => {
    editor.focus();
    // console.log(
    //   editor
    //     .getSupportedActions()
    //     .map((v) => v.id)
    //     .filter((v) => v.indexOf("action.") > -1)
    // );

    monaco.editor.registerCommand(`editor.action.quickCommand`, () => {});

    monaco.editor.addEditorAction({
      id: "editor.action.save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      label: "Save",
      run: () => {
        onSave?.(editor.getValue());
      },
    });

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

    const model = monaco.editor.createModel(
      value,
      "typescript",
      monaco.Uri.parse(`file:///W:/Projects/ezy-script/temp/sample/index.ts`)
    );

    editor.setModel(model);

    setEditor(editor);
    setMonaco(monaco);
  };

  useDeepCompareEffect(() => {
    if (editor && monaco) {
      editor.focus();

      monaco.editor.defineTheme("darkPlus", themeData);

      setSelectedTheme("darkPlus");
    }
  }, [themeData, editor, monaco]);

  useDeepCompareEffect(() => {
    if (monaco) {
      for (let i = 0; i < libs.length; i++) {
        const { path, content } = libs[i];
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          content,
          path
        );
        // monaco.languages.typescript.typescriptDefaults.addExtraLib(
        //   "export const a = 1;",
        //   nodePath
        // );
      }

      setMonaco(monaco);
    }
  }, [libs, monaco]);

  return (
    <MonacoEditor
      theme={selectedTheme}
      language="typescript"
      width="calc(100% - 200px)"
      value={value}
      onMount={handleEditorDidMount}
      options={{
        minimap: {
          scale: 1,
          enabled: true,
        },
      }}
    />
  );
};

// Add this when you learn tokenization
// monaco.languages.setLanguageConfiguration("typescript", tsToken.conf);
// monaco.languages.setMonarchTokensProvider("typescript", tsToken.language);
