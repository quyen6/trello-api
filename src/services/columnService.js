/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
import ApiError from "~/utils/ApiError";
// import { cloneDeep } from "lodash";

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
    };

    const createdColumn = await columnModel.createNew(newColumn);

    const getNewColumn = await columnModel.findOneById(
      createdColumn.insertedId
    );

    if (getNewColumn) {
      // Xử lý cấu trúc data ở đây trước khi trả về dữ liệu
      getNewColumn.cards = [];

      // Cập nhật lại mảng ColumnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
};
const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now(),
    };
    const updatedColumn = await columnModel.update(columnId, updateData);

    return updatedColumn;
  } catch (error) {
    throw error;
  }
};
const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Column not found!");
    }
    // Xóa Column
    await columnModel.deleteOneById(columnId);
    // Xóa toàn bộ Cards thuộc cái Column trên
    await cardModel.deleteAllCardByColumnId(columnId);
    // Xóa columnId trong mảng columnOrderIds của cái Board
    await boardModel.pullColumnOrderIds(targetColumn);
    return { deleteResult: "Delete Column is success!" };
  } catch (error) {
    throw error;
  }
};
export const columnService = {
  createNew,
  update,
  deleteItem,
};
