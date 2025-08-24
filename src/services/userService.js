import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { userModel } from "~/models/userModel";
import { BrevoProvider } from "~/providers/BrevoProvider";
import ApiError from "~/utils/ApiError";
import { WEBSITE_DOMAIN } from "~/utils/constants";
import { pickUser } from "~/utils/formatters";

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
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
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject =
      "Trello Project: Please verify your email before using our services!";
    const htmlContent = `
      <h3>Here is your verification link: </h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br /> - Tira Thai - </h3>
      `;
    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent);

    // Retrun trả về dữ liệu cho phía Contronller
    // pickUser: Lấy một vài dữ liệu cụ thể trong user để tránh việc trả về các dữ liệu nhạy cảm như hash password, verifyToken
    return pickUser(getNewUser);
  } catch (error) {
    console.error("❌ Error:", error.response?.body || error);
    throw error;
  }
};

export const userService = {
  createNew,
};
