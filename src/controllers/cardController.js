import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { cardService } from "~/services/cardService";
const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createNewCard = await cardService.createNew(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createNewCard);
  } catch (error) {
    next(error);
  }
};

export const cardController = {
  createNew,
};
