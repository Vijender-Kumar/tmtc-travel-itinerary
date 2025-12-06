const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const sendMail = async (email, subject, htmlcontent) => {
  try {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        host: process.env.MAIL_CONFIG_HOST,
        port: process.env.MAIL_CONFIG_PORT,
        auth: {
          user: process.env.MAIL_CONFIG_USER,
          pass: process.env.MAIL_CONFIG_PWD,
        },
        secure: false,
        tls: { rejectUnauthorized: false },
        debug: true,
      })
    );

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_CONFIG_USER}>`,
      to: email,
      subject,
      html: htmlcontent,
    };

    const sendMail = await transporter.sendMail(mailOptions);
    transporter.close();
    return sendMail;
  } catch (error) {
    console.log("error in sending Mail==========", error);
    return error;
  }
};

module.exports = { sendMail };
