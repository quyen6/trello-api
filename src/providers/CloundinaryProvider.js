import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { env } from "~/config/environment";

/**
 * Tài liệu tham khảo
 * https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
 */

// Bước cấu hình cloudinary, sử dụng version 2
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SCERET,
});

// Khởi tạo một function để thực hiện upload file lên Cloudinary

const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Tạo 1 cái luồng stream upload lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    // Thực hiện upload cái luồn trên bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const CloudinaryProvider = {
  streamUpload,
};
