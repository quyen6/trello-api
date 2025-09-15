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
    console.log("🚀 ~ createNewBoardInvitation ~ board:", board);

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
const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId);
    console.log("🚀 ~ getInvitations ~ getInvitations:", getInvitations);

    //Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy ra được nên ta biến đổi nó về json object trước khi trả về cho phía FE
    const resInvitations = getInvitations.map((i) => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {},
      };
    });

    return resInvitations;
  } catch (error) {
    throw error;
  }
};
const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation)
      throw new ApiError(StatusCodes.NOT_FOUND, "Invitation not found!");

    // Sau khi có Invitation tồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard)
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!");

    // Kiểm tra xem nế status là ACCEPTED join board mà cái thằng user(invitee) đã là owner hoặc member của board rồi thì trả về thông báo lỗi
    // Note: 2 mảng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId nên cho nó về String
    const boardOwnerAndMemberIds = [
      ...getBoard.ownerIds,
      ...getBoard.memberIds,
    ].toString();
    if (
      status === BOARD_INVITATION_STATUS.ACCEPTED &&
      boardOwnerAndMemberIds.includes(userId)
    ) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "You are already a member of this board."
      );
    }

    // Tạo dữ liệu để update bản ghi invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status, // status là ACCEPTED hoặc REJECTED do FE gửi lên
      },
    };
    // Bước 1: Cập nhật status trong bản ghi Invitation
    const updatedInvitation = await invitationModel.update(
      invitationId,
      updateData
    );

    // Bước 2: Nếu trường hợp Accept một lời mời thành công, thì phải thêm thông tin của thằng user(userId) vào bản ghi memberIds trong collection board
    if (
      updatedInvitation.boardInvitation.status ===
      BOARD_INVITATION_STATUS.ACCEPTED
    ) {
      await boardModel.pushMemberIds(boardId, userId);
    }

    return updatedInvitation;
  } catch (error) {
    throw error;
  }
};

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation,
};
