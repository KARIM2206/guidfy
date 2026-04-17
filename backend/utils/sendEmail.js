const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, token, username) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create the verification URL with the token
    const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;
    
    // HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0062cc, #0095ff); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px; }
          .button { display: block; width: 250px; margin: 30px auto; padding: 14px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; text-align: center; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 14px; color: #6c757d; background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 24px; font-weight: bold;">Multi Vendor Shop</div>
            <h1>Verify Your Account</h1>
          </div>
          <div class="content">
            <h2>Hello ${username},</h2>
            <p>Thank you for registering with Multi Vendor Shop! To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Your Account</a>
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="text-align: center; word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© 2023 Multi Vendor Shop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"Multi Vendor Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // Plain text version
      html: htmlTemplate, // HTML version
    };

    // Send the email
    await transporter.sendMail(mailOptions);
     //("📧 Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;