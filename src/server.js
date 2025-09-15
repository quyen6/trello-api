/* eslint-disable no-console */
import express from "express";
import cors from "cors";
import { corsOptions } from "~/config/cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";

import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";
import cookieParser from "cookie-parser";

// Xử lý socket real-time
import socketIo from "socket.io";
import http from "http";
import { inviteUserToBoardSocket } from "./sockets/inviteUserToBoardSocket";

const START_SERVER = () => {
  const app = express();

  // Fix vụ Cache from disk của ExpressJS
  // https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  // Cấu hình cookieParser
  app.use(cookieParser());

  //Xử lý CORS
  app.use(cors(corsOptions));

  // Enable req.body json data
  app.use(express.json());

  // Use APIs v1
  app.use("/v1", APIs_V1);

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  // Xử lý socket real-time
  // Tạo 1 server mới bọc app cuat express để làm real time với socket.io
  const server = http.createServer(app);
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions });
  io.on("connection", (socket) => {
    // Gọi các socket tùy theo tính năng ở đây
    inviteUserToBoardSocket(socket);
  });

  app.get("/", (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  // Môi trường Production (cụ thể hiện tại là đang support Render.com)
  if (env.BUILD_MODE === "production") {
    // Dùng server.listen thay vì app.listen vì lúc này server  đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Production: Hello ${env.AUTHOR}, I am running at ${process.env.PORT}`
      );
    });
  } else {
    // Môi trường Local Dev
    // Dùng server.listen thay vì app.listen vì lúc này server  đã bao gồm express app và đã config socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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
