/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard);
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

export const boardService = {
  createNew,
};
