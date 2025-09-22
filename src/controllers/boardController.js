import { StatusCodes } from "http-status-codes";
import { boardService } from "~/services/boardService";
const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    // Điều hướng dữ liệu sang tầng Service
    const createNewBoard = await boardService.createNew(userId, req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createNewBoard);
  } catch (error) {
    next(error);
  }
};
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const boardId = req.params.id;

    const board = await boardService.getDetails(userId, boardId);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id;

    const updatedBoard = await boardService.update(boardId, req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body);

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

//
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    // page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    // itemsPerPage: bao nhiêu item trên 1 page
    const { page, itemsPerPage, q } = req.query;
    const queryFilters = q;

    const result = await boardService.getBoards(
      userId,
      page,
      itemsPerPage,
      queryFilters
    );

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
};
