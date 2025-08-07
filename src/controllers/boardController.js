import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { boardService } from "~/services/boardService";
const createNew = async (req, res, next) => {
  try {
    console.log(`req.body: `, req.body);
    console.log(`req.query: `, req.query);
    console.log(`req.params: `, req.params);

    // Điều hướng dữ liệu sang tầng Service
    const createNewBoard = await boardService.createNew(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createNewBoard);
  } catch (error) {
    next(error);
  }
};

export const boardController = {
  createNew,
};
