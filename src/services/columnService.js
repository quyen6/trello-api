/* eslint-disable no-useless-catch */
import { boardModel } from "~/models/boardModel";
import { columnModel } from "~/models/columnModel";
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

export const columnService = {
  createNew,
};
