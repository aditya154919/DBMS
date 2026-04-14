exports.verify = (token) => { return `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif;
      background-color: #f4f4f4; } .container { max-width: 600px; margin: auto;
      background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0
      10px rgba(0, 0, 0, 0.1); } .header { text-align: center; padding-bottom:
      20px; border-bottom: 1px solid #eee; } .message { font-size: 16px; color:
      #555; line-height: 1.6; padding: 20px 0; } .button { display:
      inline-block; padding: 12px 24px; background-color: #00a63d; color:
      #ffffff !important; text-decoration: none; border-radius: 5px;
      font-weight: bold; } .footer { font-size: 13px; color: #999; text-align:
      center; margin-top: 30px; }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h2>Verify Your Email Address</h2>
      </div>

      <div class="message">
        <p>Hello,</p>
        <p>
          Thank you for registering with StudyNotion. Please click the button
          below to verify your account.
        </p>

        <p style="text-align: center;">
          <a
            href="http://localhost:5173/#/verify/${token}"
            target="_blank"
            class="button"
          >
            Verify Your Email
          </a>
        </p>

        <p>
          If you did not request this verification, please ignore this email.
        </p>

        <p>
          Need help? Contact us at
          <a href="mailto:info@studynotion.com">info@studynotion.com</a>
        </p>
      </div>

      <div class="footer">
        &copy; 2026 StudyNotion. All rights reserved.
      </div>
    </div>
  </body>
</html>`; };