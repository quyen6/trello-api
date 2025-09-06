/* eslint-disable no-useless-catch */
import { StatusCodes } from "http-status-codes";
import { pickUser } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import ApiError from "~/utils/ApiError";
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from "~/utils/constants";
import { userModel } from "~/models/userModel";
import { invitationModel } from "~/models/invitationModel";
// import { cloneDeep } from "lodash";

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: người đang request, tìm theo ì lấy từ token
    const inviter = await userModel.findOneById(inviterId);
    // Ngườ được mời, láy email từ FE gửi lên
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);
    // Tìm luôn Board để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId);

    if (!invitee || !inviter || !board) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Inviter, Invitee, Board not found!"
      );
    }

    // Tạo data cần thiết để lưu vào DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Modal validate ok không
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ obectId sang string vì sang bên Model có check lại dât ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING, // mặc định ban đầu là PENDING
      },
    };

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(
      newInvitationData
    );
    const getInvitation = await invitationModel.findOneById(
      createdInvitation.insertedId
    );

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả board, inviter,invitee cho FE thoải mái xử lý
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
    };
    return resInvitation;
  } catch (error) {
    throw error;
  }
};

export const invitationService = {
  createNewBoardInvitation,
};
