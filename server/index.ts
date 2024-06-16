import http from "http";
import fs from "fs";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { configs } from "@/configs";
import path from "path";

async function bootStrapApplication() {
  const app = express();

  app.use(express.json());

  app.use(
    express.urlencoded({
      extended: false,
    })
  );

  app.use(cors());

  app.use(morgan("dev"));

  fs.readdirSync("./routes", {
    encoding: "utf-8",
  }).forEach((item) => app.use("/api", require(`./routes/${item}`).default));

  if (configs.NODE_ENV !== "development") {
    app.use(express.static(path.resolve("./dist")));

    app.use("/", (request, response) => {
      response.sendFile(path.resolve("./dist/index.html"));
    });
  }

  app.use(
    (err: any, request: Request, response: Response, next: NextFunction) => {
      console.error(err.stack);
      response.status(500).json({ error: "Internal Server Error" });
    }
  );

  const server = http.createServer(app);

  server.listen(configs.PORT, () =>
    console.log(`Listening at PORT ${configs.PORT}`)
  );
}

bootStrapApplication();
