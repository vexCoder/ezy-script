import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info" | "warning";

export interface EditorState {
  action: Record<ActionKeys, ActionState>;
}

export type ActionKeys =
  | "return"
  | "show"
  | "save"
  | "play"
  | "open"
  | "prettier";

export enum ActionState {
  Loading = "loading",
  Disabled = "disabled",
  Active = "active",
  Idle = "idle",
}

const initialState: EditorState = {
  action: {
    return: ActionState.Idle,
    show: ActionState.Idle,
    save: ActionState.Disabled,
    play: ActionState.Idle,
    open: ActionState.Idle,
    prettier: ActionState.Active,
  },
};

export const actionSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setActionState: (
      state,
      action: PayloadAction<{
        action: ActionKeys;
        state?: ActionState;
      }>
    ) => {
      state.action[action.payload.action] =
        action.payload.state ?? ActionState.Idle;
    },
  },
});

export const { setActionState } = actionSlice.actions;

export default actionSlice.reducer;
