import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { columnService } from "~/services/columnService";
const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createNewColumn = await columnService.createNew(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createNewColumn);
  } catch (error) {
    next(error);
  }
};

export const columnController = {
  createNew,
};
