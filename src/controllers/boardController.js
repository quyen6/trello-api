import { StatusCodes } from "http-status-codes";

const createNew = async (req, res, next) => {
  try {
    console.log(`req.body: `, req.body);
    console.log(`req.query: `, req.query);
    console.log(`req.params: `, req.params);

    // Điều hướng dữ liệu sang tầng Service

    // Có kết quả thì trả về Client
    res
      .status(StatusCodes.CREATED)
      .json({ message: "POST from Controller : API v1 create " });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message,
    });
  }
};

export const boardController = {
  createNew,
};
