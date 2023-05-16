// eslint-disable-next-line max-classes-per-file
import type { Application } from "../app";

// class decorator
export const API =
  (namespace: string) =>
  <T extends { new (...args: any[]): {} }>(target: T) =>
    class extends target {
      namespace = namespace;
    };

export abstract class APIHandler {
  app: Application;

  namespace?: string;

  constructor(app: Application) {
    this.app = app;
  }
}
