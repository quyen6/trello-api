/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import _ from "lodash";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";
import {
  CHANGE_ROLE_USER_OR_KICK_LEAVE,
  DEFAULT_ITEM_PER_PAGE,
  DEFAULT_PAGE,
} from "~/utils/constants";
import { GET_DB } from "~/config/mongodb";
import { ObjectId, ReturnDocument } from "mongodb";
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
    const board = await boardModel.getDetails(boardId);

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
    }
    const isMember = board.memberIds?.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember) {
      {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You are not a member of this board!"
        );
      }
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
    if (updateData.title) {
      updateData.slug = slugify(updateData.title);
    }
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
const deleteItem = async (boardId) => {
  try {
    const targetBoard = await boardModel.findOneById(boardId);
    if (!targetBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
    }
    // Xóa Board
    await boardModel.deleteOneById(boardId);
    // Xóa Column trong Board đó
    await columnModel.deleteManyByBoardId(boardId);
    // Xóa Card nằm trong Column trong Board đó
    await cardModel.deleteAllCardByBoardId(boardId);

    return { deleteResult: "Delete Board is success!" };
  } catch (error) {
    throw error;
  }
};
const updateRoleUserOrRemoveUser = async (boardId, memberId, option) => {
  if (
    option === CHANGE_ROLE_USER_OR_KICK_LEAVE.KICK ||
    option === CHANGE_ROLE_USER_OR_KICK_LEAVE.LEAVE
  ) {
    try {
      const board = await boardModel.findOneById(boardId);
      if (!board) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");
      }
      // Xóa Member
      const updatedBoard = await boardModel.updateListMember(boardId, memberId);
      const getBoardDetail = await boardModel.getDetails(updatedBoard._id);
      const result = _.cloneDeep(getBoardDetail);
      // Đưa Card về đúng Column
      // MongoDB có support hàm equals
      result.columns.forEach((column) => {
        column.cards = result.cards.filter((card) =>
          card.columnId.equals(column._id)
        );

        // column.cards = resBoard.cards.filter(
        //   (card) => card.columnId.toString() === column._id.toString()
        // );
      });

      delete result.cards;

      return {
        deleteResult: "Kick member is success!",
        result,
      };
    } catch (error) {
      throw error;
    }
  } else {
    const result = await GET_DB()
      .collection(boardModel.BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId),
          "memberIds.userId": new ObjectId(memberId),
        },
        { $set: { "memberIds.$.role": option } }, // cập nhật đúng phần tử trong mảng
        { returnDocument: "after" }
      );
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Member not found in board!");
    }

    return {
      message: "Update member role success!",
      board: await boardModel.getDetails(boardId),
    };
  }
};
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteItem,
  updateRoleUserOrRemoveUser,
};
