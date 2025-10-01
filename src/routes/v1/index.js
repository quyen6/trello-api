import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "~/routes/v1/boardRoute";
import { columnRoute } from "~/routes/v1/columnRoute";
import { cardRoute } from "~/routes/v1/cardRoute";
import { userRoute } from "~/routes/v1/userRoute";
import { invitationRoute } from "./invitationRoute";
import { authRoute } from "./authRoute";
import "~/config/passport";
const Router = express.Router();

// Check APIs v1/status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "API v1 are ready" });
});

// Board APIs
Router.use("/boards", boardRoute);
// Columns APIs
Router.use("/columns", columnRoute);
// Card APIs
Router.use("/cards", cardRoute);

// User API
Router.use("/users", userRoute);
// Invitation API
Router.use("/invitations", invitationRoute);

Router.use("/auth", authRoute);
export const APIs_V1 = Router;
