import { BrowserWindow } from "electron";

export const saveToLocalStorage = async (
  win: BrowserWindow,
  key: string,
  value: string
) => {
  win.webContents.executeJavaScript(
    `localStorage.setItem('${key}', '${value}');`
  );
};

export const getFromLocalStorage = async (win: BrowserWindow, key: string) =>
  win.webContents.executeJavaScript(`localStorage.getItem('${key}');`);
