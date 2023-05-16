import "source-map-support/register";
import "reflect-metadata";
import { Application } from "./app";

Application.boot()
  .then(() => {
    console.log("Application started");
  })
  .catch((error) => {
    console.error(error);
  });
