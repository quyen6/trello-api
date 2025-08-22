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

export const userController = {
  createNew,
};
