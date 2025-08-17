/* eslint-disable no-console */
import express from "express";
import cors from "cors";
import { corsOptions } from "~/config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";

import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";
const START_SERVER = () => {
  const app = express();

  //Xử lý CORS
  app.use(cors(corsOptions));

  // Enable req.body json data
  app.use(express.json());

  // Use APIs v1
  app.use("/v1", APIs_V1);

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  app.get("/", (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  // Môi trường Production (cụ thể hiện tại là đang support Render.com)
  if (env.BUILD_MODE === "production") {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Production: Hello ${env.AUTHOR}, I am running at ${process.env.PORT}`
      );
    });
  } else {
    // Môi trường Local Dev
    app.listen(env.APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Local Dev: Hello ${env.AUTHOR}, I am running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`
      );
    });
  }

  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    console.log("4. Disconnecting from MongoDB Cloud");
    CLOSE_DB();
    console.log("5. Disconnected from MongoDB Cloud");
  });
};

// Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên
// (IIFE) - Immediately Invoked Function Expression
(async () => {
  try {
    console.log("1. Connecting to MongoDB Cloud...");
    await CONNECT_DB();
    console.log("2. Connected to MongoDB Cloud...");
    START_SERVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();

// CONNECT_DB()
//   .then(() => console.log("Connected to MgDB"))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error(error);
//     process.exit(0);
//   });
