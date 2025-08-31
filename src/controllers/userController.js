import { StatusCodes } from "http-status-codes";
import ms from "ms";
import { userService } from "~/services/userService";
import ApiError from "~/utils/ApiError";
const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createNewBoard = await userService.createNew(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createNewBoard);
  } catch (error) {
    next(error);
  }
};
const verifyAccount = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await userService.verifyAccount(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await userService.login(req.body);

    /**
     * XỬ lý trả về http only cookie cho phía trình duyệt
     * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
     * Đối với maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án. Lưu ý thời gian sống của cookie khác với thời gian sống của token nhé!
     */

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
    // console.log("🚀 ~ login ~ result:", result);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại việc gán cookie ở hàm login
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json({ loggedOut: true });
  } catch (error) {
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await userService.refreshToken(req.cookies?.refreshToken);
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Please Sign In! (Error from refresh Token)"
      )
    );
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const userAvatarFile = req.file;
    const updatedUser = await userService.update(
      userId,
      req.body,
      userAvatarFile
    );

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update,
};
