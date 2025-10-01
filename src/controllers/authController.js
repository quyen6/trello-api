import { StatusCodes } from "http-status-codes";
import ms from "ms";
import { env } from "~/config/environment";
import { authService } from "~/services/authService";
import ApiError from "~/utils/ApiError";

const login = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "No user found");

    const result = await authService.login(user);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    const redirectDomain =
      env.BUILD_MODE === "dev"
        ? env.WEBSITE_DOMAIN_DEVELOPMENT
        : env.WEBSITE_DOMAIN_PRODUCTION;
    res.redirect(
      `${redirectDomain}/login/oauth-success?email=${result.user.email}`
    );
  } catch (error) {
    next(error);
  }
};

export const authController = {
  login,
};
