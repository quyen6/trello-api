/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import _ from "lodash";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";
import { DEFAULT_ITEM_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants";
// import { cloneDeep } from "lodash";

const createNew = async (userId, reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard);
    // console.log("🚀 ~ createNew ~ createdBoard:", createdBoard);

    // Lấy bản ghi board sau khi gọi(tùy mục đích dự án mà có càn bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);
    // console.log("🚀 ~ createNew ~ getNewBoard:", getNewBoard);

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án ... vv
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo ... vv

    // Trả kết quả về, trong Service luôn có return
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
    }

    const resBoard = _.cloneDeep(board);
    // Đưa Card về đúng Column

    // MongoDB có support hàm equals
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id)
      );

      // column.cards = resBoard.cards.filter(
      //   (card) => card.columnId.toString() === column._id.toString()
      // );
    });

    delete resBoard.cards;

    return resBoard;
  } catch (error) {
    throw error;
  }
};
const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    };
    const updatedBoard = await boardModel.update(boardId, updateData);

    return updatedBoard;
  } catch (error) {
    throw error;
  }
};
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    //  B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    });
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    });
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo */
    await cardModel.update(reqBody.curentCardId, {
      columnId: reqBody.nextColumnId,
    });

    return { updateResult: "Successfully" };
  } catch (error) {
    throw error;
  }
};

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEM_PER_PAGE;
    const result = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    );

    return result;
  } catch (error) {
    throw error;
  }
};

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
};
