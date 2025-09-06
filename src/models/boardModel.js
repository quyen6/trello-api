import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { BOARD_TYPE } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";
import { pagingSkipValue } from "~/utils/algorithms";
import { userModel } from "./userModel";
// Define Collection (name & Schema)

const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  // type: Joi.string().valid(...Object.values(BOARD_TYPE)).required(), // thay vì gọi lần lượt có thể thay thế bằng ...Object.values() để sau này có thay đổi trong BOARD_TYPE thì cũng không cần đụng vào nữa
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),
  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // Những Admin của Board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  // Những thành viên của Board
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

// Chỉ định ra những trường mà chúng ta không cho phép cập nhậttrong hàm update
const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)],
    };

    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (boardId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(boardId),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
//Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (userId, boardId) => {
  try {
    const queryConditons = [
      { _id: new ObjectId(boardId) },
      // Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện thứ 02: userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds hoặc memberIds, sư dụng toán từ $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ];
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: queryConditons,
          },
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "columns",
          },
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: "ownerIds",
            foreignField: "_id",
            as: "owners",
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            // $project để chỉ định vài field không muốn lấy về băng cách gán nó giá trị 0
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: "memberIds",
            foreignField: "_id",
            as: "members",
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }],
          },
        },
      ])
      .toArray();

    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

// Nhiệm vụ của func này là push 1 cái giá trị columnId vào mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { ReturnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Lấy 1 phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { ReturnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho cập nhật linh tinh
    Object.keys(updateData).forEach((item) => {
      if (INVALID_UPDATE_FIELDS.includes(item)) {
        delete updateData[item];
      }
    });

    // Đối với những dữ liệu liên quan đến ObjectId , biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (_id) => new ObjectId(_id)
      );
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(boardId) },
        { $set: updateData },
        { ReturnDocument: "after" } // trả về kết quả mới sau khi cập nhật
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditons = [
      // Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện thứ 02: userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds hoặc memberIds, sư dụng toán từ $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ],
      },
    ];

    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryConditons } },
          // $sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường ( theo chuản mã ASCII)
          { $sort: { title: 1 } },
          // $facet đế xử lý nhiều luồng trong một query
          {
            $facet: {
              // Luồng 1: Query boards
              queryBoards: [
                { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi củra những page trước đó
                { $limit: itemsPerPage }, // Giới hạn tối đa số lượng bản ghi trả về trong một page
              ],

              // Luồng 2: Query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
              queryTotalBoards: [{ $count: "countedAllBoards" }],
            },
          },
        ],
        // Khai báo thêm thuộc tính collation locale "en" để fix vụ chữ B hoa và a thường ở $sort bên trên
        { collation: { locale: "en" } }
      )
      .toArray();
    // console.log("🚀 ~ getBoards ~ query:", query);

    const res = query[0];

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
};
