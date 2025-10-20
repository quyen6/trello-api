import { boardModel } from "~/models/boardModel";
import { boardService } from "~/services/boardService";
// import { invitationModel } from "~/models/invitationModel";
import { BOARD_INVITATION_STATUS } from "~/utils/constants";
export const memberJoinBoardSocket = (socket) => {
  socket.on("FE_USER_JOIN_BOARD", async (updateBoardInvitation) => {
    try {
      const { inviteeId, inviteeRole, boardInvitation, inviterId } =
        updateBoardInvitation;

      // const invitationId = boardInvitation._id;
      const boardId = boardInvitation.boardId;
      const status = boardInvitation.status;

      // 2️⃣ Nếu ACCEPTED → thêm user vào board
      if (status === BOARD_INVITATION_STATUS.ACCEPTED) {
        const updatedBoard = await boardModel.pushMemberIds(
          boardId,
          inviteeId,
          inviteeRole
        );
        const updatedBoardAllInformationMember = await boardService.getDetails(
          inviterId,
          updatedBoard._id
        );

        socket.broadcast.emit(
          "BE_USER_JOIN_BOARD",
          updatedBoardAllInformationMember
        );
      }

      // 4️⃣ Emit thông báo ngược lại cho FE (nếu cần)
    } catch (error) {
      console.error("❌ memberJoinBoard error:", error);
      socket.emit("BE_UPDATE_INVITATION_ERROR", error.message);
    }
  });
};
