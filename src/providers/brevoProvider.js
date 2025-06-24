// Brevo là tên thương hiệu mới của sib - Sendinblue
const brevo = require('@getbrevo/brevo');
const { env } = require('~/config/environment');
// Xem thêm phần cấu hình brevo ở Brevo dashboard > Account > SMTP & API > API keys

let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Khởi tạo sendSMTP mail với những thông tin cần thiết
  console.log(env.BREVO_API_KEY, env.ADMIN_EMAIL_ADDRESS, env.ADMIN_EMAIL_NAME);
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Tài khoản gửi mail phải là tài khoản email mà chúng ta đã tạo trên brevo
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  }

  // Những tài khoản nhận mail
  // To phải là 1 array để chúng ta có thể tùy biến và gửi 1 email tới nhiều người
  sendSmtpEmail.to = [
    { email: recipientEmail }
  ]

  // Tiêu đề của email
  sendSmtpEmail.subject = customSubject

  // Nội dung email dạng HTML
  sendSmtpEmail.htmlContent = htmlContent

  // Gọi hành động gửi mail
  return await apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}