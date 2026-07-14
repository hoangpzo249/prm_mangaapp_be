const nodemailer = require('nodemailer');

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Mặc định dùng gmail (có thể thay đổi)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Gửi email chung
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung text
 * @param {string} html - Nội dung html (tuỳ chọn)
 */
exports.sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"FComic Support" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw new Error('Không thể gửi email, vui lòng thử lại sau.');
    }
};
