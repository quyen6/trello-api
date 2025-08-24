// Brevo là  tên thương hiệu mới của Sib - Sendinblue

const SibApiV3Sdk = require("@getbrevo/brevo");
const { env } = require("~/config/environment");

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Khởi tạo sendSmtpEmail
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  // Tài khoản gửi mail:
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  };

  // Những tài khoản nhận email
  // to là 1 Array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user tùy tính năng dự án
  sendSmtpEmail.to = [{ email: recipientEmail }];

  // Tiêu đề email:
  sendSmtpEmail.subject = customSubject;

  // Email dạng html
  sendSmtpEmail.htmlContent = customHtmlContent;

  // Gọi hành động gửi mail
  // sendTransacEmail trả về 1 Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
  sendEmail,
};
