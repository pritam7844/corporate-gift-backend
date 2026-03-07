import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    // 1. Create a transporter (using SMTP credentials from your .env file)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `Corporate Gift Platform <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      // You can also pass HTML if you want styled emails later
      // html: options.html 
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(` Error sending email: ${error.message}`);
  }
};