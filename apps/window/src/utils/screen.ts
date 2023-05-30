import electron, { BrowserWindow } from "electron";

export const transformScreen = (screen: electron.Display) => {
  const { width, height, x, y } = screen.bounds;
  return {
    id: screen.id,
    name: screen.label,
    width,
    height,
    x,
    y,
  };
};
export type Screen = ReturnType<typeof transformScreen>;

export const getScreens = () => {
  const screens = electron.screen.getAllDisplays();

  return screens.map(transformScreen);
};

export const getCurrentScreen = (win: BrowserWindow) => {
  const screen = electron.screen.getDisplayNearestPoint({
    x: win.getPosition()[0],
    y: win.getPosition()[1],
  });

  return transformScreen(screen);
};

export const getPrimaryScreen = () => {
  const screen = electron.screen.getPrimaryDisplay();

  return transformScreen(screen);
};

export const getAppPositioning = (win: BrowserWindow, activeScreen: Screen) => {
  const { width } = win.getBounds();

  const x = activeScreen ? activeScreen.width / 2 - width / 2 : 0;

  const y = activeScreen ? activeScreen.height / 32 : 0;

  return {
    x: Math.floor(x),
    y: Math.floor(y),
  };
};
