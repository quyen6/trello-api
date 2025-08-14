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
const getDetails = async (req, res, next) => {
  try {
    console.log(`req.params: `, req.params);
    const boardId = req.params.id;

    const board = await boardService.getDetails(boardId);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    console.log(`req.params: `, req.params);
    const boardId = req.params.id;

    const updatedBoard = await boardService.update(boardId, req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};

export const boardController = {
  createNew,
  getDetails,
  update,
};
