const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abiir.ashhab@gmail.com",
    pass: "zfik mxqh ueqq fgvj", // use your actual app password
  },
});

const mailOptions = {
  from: "abiir.ashhab@gmail.com",
  to: "abir.ashab@cefalo.com", // try with your own address
  subject: "Test Email",
  text: "Hello, this is a test email from nodemailer.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Email error:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
