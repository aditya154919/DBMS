const passwordResetOtpTemplate = (otp, name = "User") => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px;">
          
          <tr>
            <td align="center">
              <h2 style="color:#333;">Password Reset Request</h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 15px 0; color:#555; font-size:14px;">
              Hello <strong>${name}</strong>,
              <br><br>
              We received a request to reset your password.
              Use the OTP below to proceed.
              <br><br>
              <strong>This OTP is valid for 5 minutes.</strong>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 0;">
              <div style="
                font-size:28px;
                font-weight:bold;
                letter-spacing:6px;
                color:#d93025;
                background:#fdecea;
                padding:15px 30px;
                border-radius:6px;
                display:inline-block;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td style="color:#555; font-size:14px;">
              If you did not request a password reset, please ignore this email.
              Your account is safe.
            </td>
          </tr>

          <tr>
            <td style="padding-top:30px; color:#999; font-size:12px;" align="center">
              © 2026 StudyNotion. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = passwordResetOtpTemplate;
