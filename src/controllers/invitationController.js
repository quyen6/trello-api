import { StatusCodes } from "http-status-codes";
import { invitationService } from "~/services/invitationService";
const createNewBoardInvitation = async (req, res, next) => {
  try {
    // User thực hiện request này chính là inviter - người đi mời
    const inviterId = req.jwtDecoded._id;
    // Điều hướng dữ liệu sang tầng Service
    const resInvitation = await invitationService.createNewBoardInvitation(
      req.body,
      inviterId
    );

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(resInvitation);
  } catch (error) {
    next(error);
  }
};

export const invitationController = {
  createNewBoardInvitation,
};
