export const getOTPEmailTemplate = (otp, type = "registration") => {
  const currentYear = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CarGenie OTP Verification</title>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Arial', sans-serif;
      }
      .header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        padding: 20px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .header img {
        max-width: 150px;
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .otp-container {
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        text-align: center;
      }
      .otp-code {
        font-size: 32px;
        letter-spacing: 8px;
        color: #1e3c72;
        font-weight: bold;
        padding: 10px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: #6c757d;
        font-size: 12px;
      }
      .button {
        background-color: #1e3c72;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin: 20px 0;
      }
      .warning {
        color: #dc3545;
        font-size: 12px;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="color: white; margin: 0;">CarGenie</h1>
      </div>
      <div class="content">
        <h2>Verification Required</h2>
        <p>Hello,</p>
        <p>Thank you for choosing CarGenie! Please use the following OTP to complete your ${type}:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p>This OTP will expire in 5 minutes for security purposes.</p>
        
        <div class="warning">
          <p>⚠️ Never share this OTP with anyone. CarGenie representatives will never ask for your OTP.</p>
        </div>
        
        <div class="footer">
          <p>© ${currentYear} CarGenie. All rights reserved.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
    `;
};
