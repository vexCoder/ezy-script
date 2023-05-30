import { PrismaClient } from "@ezy/database";
import dotenv from "dotenv";
import { app, BrowserWindow, globalShortcut } from "electron";
import { createIPCHandler } from "electron-trpc/main";
import { join } from "path";
import { EventEmitter } from "events";
import { appRouter } from "./api";
import { createContext } from "./trpc";
import {
  getAppPositioning,
  getPrimaryScreen,
  getScreens,
  Screen,
} from "./utils/screen";

dotenv.config({
  path: join(__dirname, "..", ".env"),
});

export class Application {
  win: BrowserWindow | undefined;

  activeScreen: Screen | undefined;

  client: PrismaClient;

  emitter: EventEmitter;

  constructor() {
    this.client = new PrismaClient();
    this.emitter = new EventEmitter();
  }

  async init() {
    const settings = await this.client.settings.findFirst({});
    const savedScreen = Number(settings?.primaryScreen);
    const screens = getScreens();
    const currentScreen =
      screens.find((v) => v.id === savedScreen) ?? getPrimaryScreen();

    if (currentScreen) {
      this.activeScreen = currentScreen;
    }

    const defaultSettings = {
      ...(currentScreen && {
        primaryScreen: BigInt(currentScreen.id),
      }),
    };

    if (!settings) {
      await this.client.settings.create({
        data: {
          ...defaultSettings,
        },
      });
    } else {
      await this.client.settings.update({
        where: {
          id: settings.id,
        },
        data: {
          ...defaultSettings,
        },
      });
    }

    if (this.win && this.client && this.activeScreen) {
      createIPCHandler({
        router: appRouter,
        windows: [this.win],
        createContext: createContext({
          win: this.win,
          client: this.client,
          emitter: this.emitter,
          screen: this.activeScreen,
        }),
      });
    }

    if (this.win && currentScreen) {
      const { x, y } = getAppPositioning(this.win, currentScreen);

      console.log(x, y);
      this.win.setPosition(x, y);
      this.win.show();
      this.win.webContents.openDevTools({
        mode: "detach",
      });
    }

    return this;
  }

  makeWindow() {
    // Change to the view's path/url
    const urlOrPath = "http://localhost:3000";
    const width = 600;
    const height = 95 + 50;

    this.win = new BrowserWindow({
      width,
      height,
      maxHeight: height,
      frame: false,
      transparent: true,
      movable: false,
      show: false,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
      },
    });

    const isUrl = urlOrPath.startsWith("http");
    if (isUrl) this.win.loadURL(urlOrPath);
    if (!isUrl) this.win.loadFile(urlOrPath);

    return this;
  }

  startEvents() {
    if (!this.win) return this;

    app.on("window-all-closed", () => {
      console.log("window-all-closed");
      if (process.platform !== "darwin") {
        // Quit process if all windows are closed
        app.quit();
      }
    });

    globalShortcut.register("CommandOrControl+Shift+P", () => {
      if (this.win) {
        if (this.win.isVisible()) {
          this.emitter.emit("toggle-window-visibility", "hide");
        } else {
          this.emitter.emit("toggle-window-visibility", "show");
        }
      }
    });

    return this;
  }

  attachHandlers() {
    if (!this.win) return this;
    // Attach handlers to the window

    return this;
  }

  static async boot() {
    // eslint-disable-next-line global-require
    if (require("electron-squirrel-startup")) return;

    await app.whenReady();

    // eslint-disable-next-line prettier/prettier
    const application = new Application();

    await application.makeWindow().startEvents().attachHandlers().init();
  }
}
