import { MongoClient, ServerApiVersion } from "mongodb";

import { env } from "~/config/environment";
// Khởi tạo 1 đối tượng trelloDatabaseInstance ban đầu là null (cì chúng ta chưa connect)
let trelloDatabaseInstance = null;

// Khởi tạo 1 đối tượng Client Instance để connect tới MongoDB
const mongoClientInstace = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Kết nối tới Database conncetDB
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas tới URI đã khai báo trong thân của mongoClientInstace
  await mongoClientInstace.connect();

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstace.db(env.DATABASE_NAME);
};

// Function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành  công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance)
    throw new Error("Must conncet to Database first!");
  return trelloDatabaseInstance;
};

// ĐÓng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  console.log("Code chạy CLOSE_DB");

  await mongoClientInstace.close();
};
