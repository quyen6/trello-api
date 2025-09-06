import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";

const createNewBoardInvitation = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required(),
    inviteeEmail: Joi.string().required(),
  });

  try {
    // Chỉ định abortEarly: false trong trường hợp nhiều lỗi Validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const invitationValidation = {
  createNewBoardInvitation,
};
