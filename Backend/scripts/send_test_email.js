require('dotenv').config();
const { sendMail, registrationEmail } = require('../utils/mailer');

(async () => {
  const to = process.env.TEST_EMAIL || process.env.SMTP_USER || 'test@example.com';
  console.log('Sending test email to', to);
  try {
    const mail = registrationEmail('Test User', process.env.SITE_NAME || 'AISCSTEWA');
    const info = await sendMail({ to, ...mail });
    console.log('sendMail returned:', info && info.messageId ? info.messageId : info);
    process.exit(0);
  } catch (err) {
    console.error('Test send failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();