const nodemailer = require("nodemailer");

let transporter = null;

function init() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  console.log(`Email notifications enabled via ${SMTP_HOST}`);
}

async function notifyHost(visitor) {
  if (!transporter || !visitor.host_email) return;

  const from = process.env.NOTIFY_FROM || "reception@flyerdefense.com";

  await transporter.sendMail({
    from,
    to: visitor.host_email,
    subject: `Flyer Defense — Visitor arrived: ${visitor.visitor_name}`,
    text: [
      `Your visitor has arrived at the Flyer Defense front desk.`,
      ``,
      `Name:    ${visitor.visitor_name}`,
      `Company: ${visitor.company || "N/A"}`,
      `Purpose: ${visitor.purpose}`,
      `Badge:   ${visitor.badge_number || "N/A"}`,
      `Time:    ${visitor.sign_in_time}`,
      ``,
      `Please come to reception to greet your guest.`,
      ``,
      `— Flyer Defense Visitor Management`,
    ].join("\n"),
  });
}

module.exports = { init, notifyHost };
