const nodemailer = require('nodemailer');

// Configure transporter using environment variables
// Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
const host = process.env.SMTP_HOST || '';
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';
const from = process.env.FROM_EMAIL || `no-reply@${process.env.APP_DOMAIN || 'example.com'}`;

let transporter;
let isTestAccount = false;

async function createTransporter() {
  if (transporter) return transporter;
  // If SMTP is fully configured, use it
  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass }
    });
    isTestAccount = false;
    return transporter;
  }

  // Fallback: create an Ethereal test account so we can preview emails locally
  try {
    console.warn('SMTP not configured; creating Ethereal test account for local email preview.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    isTestAccount = true;
    console.info('Ethereal account created. Preview emails at nodemailer.getTestMessageUrl(info) after sending.');
    return transporter;
  } catch (e) {
    console.warn('Failed to create Ethereal account:', e && e.message ? e.message : e);
    return null;
  }
}

async function sendMail({ to, subject, text, html }) {
  try {
    let tr = createTransporter();
    let usedTestAccount = false;
    // If no SMTP configured, create an Ethereal test account for local testing
    if (!tr) {
      try {
        console.warn('SMTP not configured. Creating Ethereal test account for local testing.');
        const testAccount = await nodemailer.createTestAccount();
        tr = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
        usedTestAccount = true;
      } catch (acctErr) {
        console.warn('Failed to create Ethereal test account:', acctErr && acctErr.message ? acctErr.message : acctErr);
      }
    }

    if (!tr) {
      console.warn('sendMail skipped because transporter could not be created');
      return;
    }

    const info = await tr.sendMail({ from, to, subject, text, html });
    console.log('Email sent:', info && info.messageId ? info.messageId : info);

    if (usedTestAccount) {
      // Log preview URL for Ethereal
      try {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log('Ethereal preview URL:', preview);
      } catch (e) {
        console.warn('Could not get Ethereal preview URL:', e && e.message ? e.message : e);
      }
    }

    return info;
  } catch (err) {
    console.error('Email send failed:', err && err.message ? err.message : err);
    // don't throw to avoid breaking request flow
  }
}

function registrationEmail(name, siteName = 'AISCSTEWA') {
  const subject = 'Registration Successful';
  const text = `Hello ${name},\n\nYour registration is successfully done. Thanks for visiting ${siteName}. Have a nice day!\n\nRegards,\n${siteName}`;
  const html = `<p>Hello ${name},</p><p>Your registration is <strong>successfully done</strong>. Thanks for visiting <strong>${siteName}</strong>. Have a nice day!</p><p>Regards,<br/>${siteName}</p>`;
  return { subject, text, html };
}

function approvalEmail(name, approved = true, siteName = 'AISCSTEWA') {
  const subject = approved ? 'Profile Approved' : 'Profile Rejected';
  const text = approved
    ? `Hello ${name},\n\nYour profile has been approved by admin. You can now access the site features.\n\nRegards,\n${siteName}`
    : `Hello ${name},\n\nWe are sorry to inform you that your registration has been rejected. For more information please contact the administrator.\n\nRegards,\n${siteName}`;
  const html = approved
    ? `<p>Hello ${name},</p><p>Your profile has been <strong>approved</strong> by admin. You can now access the site features.</p><p>Regards,<br/>${siteName}</p>`
    : `<p>Hello ${name},</p><p>We are sorry to inform you that your registration has been <strong>rejected</strong>. For more information please contact the administrator.</p><p>Regards,<br/>${siteName}</p>`;
  return { subject, text, html };
}

module.exports = { sendMail, registrationEmail, approvalEmail };
