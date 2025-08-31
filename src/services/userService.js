/* eslint-disable no-useless-catch */
import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/config/environment";
import { userModel } from "~/models/userModel";
import { BrevoProvider } from "~/providers/BrevoProvider";
import { CloudinaryProvider } from "~/providers/CloundinaryProvider";
import { JwtProvider } from "~/providers/JwtProvider";
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

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
    // Nếu account đã được active thì bắn lỗi
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is already active"
      );
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid");

    // Nếu như mọi thứ OK thì chúng ta sẽ cập nhật update lại thông tin của user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null,
    };
    // Thực hiện update user
    const updatedUser = await userModel.update(existUser._id, updateData);
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};
const login = async (reqBody) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
    // Nếu account đã được active thì bắn lỗi
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is not active"
      );
    // nếu không match password
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your email or password is incorrect"
      );
    }
    /** Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE */
    // Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email,
    };

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về phía BE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    );
    return { accessToken, refreshToken, ...pickUser(existUser) };
    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
  } catch (error) {
    throw error;
  }
};
const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email,
    };

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE // 1 tiếng
      // 5 // 5 giây | để test accessToken hết hạn
    );

    return { accessToken };
  } catch (error) {
    throw error;
  }
};
const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query user trong Database
    const existUser = await userModel.findOneById(userId);

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
    // Nếu account đã được active thì bắn lỗi
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your account is not active"
      );

    // Khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {};

    // Trường hợp check password
    if (reqBody.current_password && reqBody.new_password) {
      // kiểm tra xem current password có đúng hay không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Your password is incorrect"
        );
      } else {
        // Nếu current password đúng ta sẽ hash mật khẩu mới và update vào DB:
        updatedUser = await userModel.update(userId, {
          password: bcryptjs.hashSync(reqBody.new_password, 8),
        });
      }
    } else if (userAvatarFile) {
      // Trường hợp upload file lên Cloud Storage, cụ thể Cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        "users"
      );

      // Lưu lại URL (secure_url) của file ảnh vào trong DB
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url,
      });
    } else {
      // Trường hợp update các thông tin chung
      updatedUser = await userModel.update(userId, reqBody);
    }
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};
export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
};
