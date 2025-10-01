import express from "express";
import passport from "passport";
import { authController } from "~/controllers/authController";
import { authMiddleware } from "~/middlewares/authMiddleware";
import { userModel } from "~/models/userModel";
import { StatusCodes } from "http-status-codes";
import { pickUser } from "~/utils/formatters";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.login
);
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  authController.login
);

router.get("/me", authMiddleware.isAuthorized, async (req, res) => {
  const userId = req.jwtDecoded._id;
  const user = await userModel.findOneById(userId);
  res.status(StatusCodes.OK).json(pickUser(user));
});

export const authRoute = router;
