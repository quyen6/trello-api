import { StatusCodes } from "http-status-codes";
import { userService } from "~/services/userService";
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

    // Xử lý về http only cookie cho phía trình duyệt
    // console.log("🚀 ~ login ~ result:", result);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
};
