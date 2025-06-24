// mailProvider.js
const nodemailer = require('nodemailer');
import hbs from 'nodemailer-express-handlebars';
const path = require('path');
const { env } = require('~/config/environment');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Hoặc Mailgun, SendGrid, ...
  port: 587,
  secure: false,
  auth: {
    user: env.MAIL_USERNAME, // Ví dụ: 'your_email@gmail.com'
    pass: env.MAIL_PASSWORD,
  }
});

// === CONFIG TEMPLATE ENGINE ===
transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    layoutsDir: '', // bỏ layout nếu không dùng
    partialsDir: path.resolve(__dirname, '../templates/email/'),
    defaultLayout: false
  },
  viewPath: path.resolve(__dirname, '../templates/email/'),
  extName: '.hbs'
}));

// === HÀM 1: Gửi mail chào mừng ===
const sendRegisterEmail = async ({ to, subject, context }) => {
  return transporter.sendMail({
    from: env.MAIL_NAME,
    to,
    subject,
    template: 'Register',
    context: {
      heading: context.heading || 'Chào mừng!',
      message: context.message || 'Bạn đã đăng ký thành công.',
      ...context,
      year: new Date().getFullYear()
    }
  });
};

module.exports = { sendRegisterEmail };
