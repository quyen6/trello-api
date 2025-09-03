import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from "~/utils/validators";

/** Hầu hết nhưng thứ bên dưới đều có ở docs multer, chỉ tổ chức lại sao cho khoa học gọn gàng
 * https://www.npmjs.com/package/multer
 */

// Function Kiểm tra loại file nào được chấp nhận

const customFileFilter = (req, file, callback) => {
  // Đối với Multer kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = "File type is invalid. Only accept jpg, jpeg and png";
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage),
      null
    );
  }

  // Nếu như kiểu file hợp lệ:
  return callback(null, true);
};

// Khởi tạo function upload được bọc với thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter,
});

export const multerUploadMiddleware = {
  upload,
};
