import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import { pickUser } from "~/utils/formatters";

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists!");
    }
    // Tạo  data lưu là database
    // nameFromEmail: nếu email là myquyen@gmail.com thì sẽ lấy được "myquyen"
    const nameFromEmail = reqBody.email.split("@")[0];
    const newUser = {
      email: reqBody.email,
      // băm password dùng bcryptjs
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail, // mặc định để gióng username khi user đăng kí mới, về sau làm tính năng update cho user

      verifyToken: uuidv4(),
    };
    // Thực hiện lưu thông tin vào database
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);
    // Gửi Email cho người dùng xác thực tài khoản

    // Retrun trả về dữ liệu cho phía Contronller
    return pickUser(getNewUser);
  } catch (error) {
    throw Error(error);
  }
};

export const userService = {
  createNew,
};
