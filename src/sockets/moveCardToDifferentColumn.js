export const moveCardTODifferentColumnSocket = (socket) => {
  // Lắng nghe sự kiện mà client emit lên
  socket.on("FE_MOVE_CARD_TO_DIFFERENT_COLUMN", (data) => {
    // cách làm nhanh và đơn giản nhất: emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), ròi để phí FE check
    socket.broadcast.emit("BE_MOVE_CARD_TO_DIFFERENT_COLUMN", data);
  });
};
