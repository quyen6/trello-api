import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
} from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .messages({ EMAIL_RULE_MESSAGE }),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .messages({ PASSWORD_RULE_MESSAGE }),
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
const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .messages({ EMAIL_RULE_MESSAGE }),
    token: Joi.string().required(),
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

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .messages({ EMAIL_RULE_MESSAGE }),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .messages({ PASSWORD_RULE_MESSAGE }),
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

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    displayName: Joi.string().trim().strict(),
    current_password: Joi.string()
      .pattern(PASSWORD_RULE)
      .messages({ PASSWORD_RULE_MESSAGE }),
    new_password: Joi.string()
      .pattern(PASSWORD_RULE)
      .messages({ PASSWORD_RULE_MESSAGE }),
  });

  try {
    // Lưu ý đối với trường hợp update, cho phép Unknow để không cần đẩy moottj số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
};
