import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardValidation } from "~/validations/boardValidation";
import { boardController } from "~/controllers/boardController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.route("/")
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(
    authMiddleware.isAuthorized,
    boardValidation.createNew,
    boardController.createNew
  );

Router.route("/:boardId/members/:memberId").put(
  authMiddleware.isAuthorized,
  boardValidation.updateRoleUserOrRemoveUser,
  boardController.updateRoleUserOrRemoveUser
);
Router.route("/:id")
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(
    authMiddleware.isAuthorized,
    boardValidation.update,
    boardController.update
  )
  .delete(
    authMiddleware.isAuthorized,
    boardValidation.deleteItem,
    boardController.deleteItem
  );

// API di chuyển card giữa các column khác nhau trong 1 board
Router.route("/supports/moving_card").put(
  authMiddleware.isAuthorized,
  boardValidation.moveCardToDifferentColumn,
  boardController.moveCardToDifferentColumn
);

export const boardRoute = Router;
