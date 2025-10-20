export const commentCardSocket = (socket) => {
  // Lắng nghe sự kiện mà client emit lên
  socket.on("FE_COMMENT_CARD", (data) => {
    // cách làm nhanh và đơn giản nhất: emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi request lên), ròi để phí FE check
    // data.memberIds = data.memberIds.map((m) => new ObjectId(m));
    socket.broadcast.emit(`BE_COMMENT_CARD_${data._id}`, data);
  });
};
