import Joi from "joi";
import { StatusCodes } from "http-status-codes";

const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho Front-end tự validate và custom message phía FE cho đẹp
   * Back-end chỉ cần validate Đảm Bào Dữ Liệu Chuẩn Xác, và trả về message mặc định từ thư viện là được.
   * Quan trọng: Việc Validate dữ liệu BẮT BUỘC phải có ở phía Back-end vì đây là điểm cuối đề lưu trữ dữ liệu vào Database.
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả Back-end và Front-end nhé.
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      // custom Error Message with Joi
      "any.required": "Title is required (miquin)",
      "string.empty": "Title is not allowed to be empty (miquin)",
      "string.min": "length must be at least 3 characters long (miquin)",
      // ....
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
  });

  try {
    console.log(`req.body: `, req.body);

    // Chỉ định abortEarly: false trong trường hợp nhiều lỗi Validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // next()
    res
      .status(StatusCodes.CREATED)
      .json({ message: "POST from validation : API v1 create " });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message,
    });
  }
};

export const boardValidation = {
  createNew,
};
