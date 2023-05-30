import "@codingame/monaco-vscode-api/default-extensions/typescript-language-features";
import "@codingame/monaco-vscode-api/default-extensions/json";
import { initialize } from "@codingame/monaco-vscode-api/services";
import getModelEditorServiceOverride from "@codingame/monaco-vscode-api/service-override/modelEditor";
import getTextMateServiceOverride from "@codingame/monaco-vscode-api/service-override/textmate";
import * as monaco from "monaco-editor";

export const makeEditor = async (reference: HTMLDivElement) => {
  await initialize({
    ...getModelEditorServiceOverride(async (model, input) => {
      const editor = monaco.editor.create(reference, {
        model: model.object.textEditorModel,
        ...input,
      });

      return editor;
    }),
    ...getTextMateServiceOverride(),
  });
};
