const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send password reset email to user with reset link.
 */
async function sendPasswordResetEmail(toEmail, resetUrl, userName) {
  const mailOptions = {
    from: `"${process.env.SHOP_NAME || 'GSTKhata'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - GSTKhata',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">GSTKhata</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 13px;">Password Reset Request</p>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password for your <strong>GSTKhata</strong> account.</p>
          <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; word-break: break-all; color: #2563eb;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Send invoice PDF via email to party/customer.
 */
async function sendInvoiceEmail(toEmail, bill, pdfBuffer, shopName) {
  const senderName = shopName || process.env.SHOP_NAME || 'GSTKhata';
  const targetEmail = toEmail || 'rmbinsuranceservice776@gmail.com';

  const mailOptions = {
    from: `"${senderName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: targetEmail,
    subject: `Tax Invoice ${bill.invoice_no} from ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">${senderName}</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 13px;">GST Tax Invoice #${bill.invoice_no}</p>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p>Dear <strong>${bill.party_name}</strong>,</p>
          <p>Thank you for doing business with <strong>${senderName}</strong>. Please find attached your official GST Tax Invoice below:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Invoice Number:</td>
                <td style="padding: 4px 0; font-weight: bold; text-align: right;">${bill.invoice_no}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Invoice Date:</td>
                <td style="padding: 4px 0; text-align: right;">${new Date(bill.invoice_date).toLocaleDateString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Payment Status:</td>
                <td style="padding: 4px 0; text-align: right;"><span style="color: ${bill.status === 'Paid' ? '#16a34a' : '#dc2626'}; font-weight: bold;">${bill.status}</span></td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 8px 0 0 0; font-weight: bold; font-size: 16px;">Grand Total:</td>
                <td style="padding: 8px 0 0 0; font-weight: bold; font-size: 16px; color: #2563eb; text-align: right;">₹${Number(bill.grand_total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <p>The detailed Tax Invoice PDF has been attached to this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent via GSTKhata Smart Billing System.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice_${bill.invoice_no}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail, sendInvoiceEmail };
