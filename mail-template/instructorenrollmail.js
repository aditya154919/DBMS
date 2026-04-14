export const instructorEnrollmentEmail = (
  courseName,
  studentName,
  amount
) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>New Student Enrolled</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }
        .header h2 {
          color: #16a34a;
          margin: 0;
        }
        .content {
          padding: 20px 0;
          color: #374151;
          line-height: 1.6;
        }
        .highlight {
          font-weight: bold;
          color: #111827;
        }
        .amount {
          color: #2563eb;
          font-weight: bold;
        }
        .footer {
          margin-top: 24px;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }
        .badge {
          display: inline-block;
          background-color: #dcfce7;
          color: #166534;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 14px;
          margin-top: 12px;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 New Student Enrolled!</h2>
          <div class="badge">Enrollment Successful</div>
        </div>

        <div class="content">
          <p>Hello Instructor,</p>

          <p>
            We’re excited to inform you that a new student has enrolled in your
            course <span class="highlight">"${courseName}"</span>.
          </p>

          <p>
            <span class="highlight">${studentName}</span> has successfully
            completed the enrollment process.
          </p>

          <p>
            <strong>Course Price:</strong>
            <span class="amount">₹${amount}</span>
          </p>

          <p>
            Keep up the great work and continue inspiring learners on your
            journey 🚀
          </p>

          <p>Best regards,<br /><strong>StudyNotion Team</strong></p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} StudyNotion. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
};
