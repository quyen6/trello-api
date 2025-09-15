export const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện mà client emit lên
  socket.on("FE_USER_INVITED_TO_BOARD", (invitation) => {
    // cách làm nhanh và đơn giản nhất: emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), ròi để phí FE check
    socket.broadcast.emit("BE_USER_INVITED_TO_BOARD", invitation);
  });
};
