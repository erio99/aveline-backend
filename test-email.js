import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false  // ✅ Ignorer les erreurs de certificat
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: `"AVELINE Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '🧪 Test Email AVELINE',
      html: '<h1>Test réussi !</h1><p>Si tu reçois cet email, la configuration est bonne.</p>'
    });
    console.log('✅ Email envoyé ! ID:', info.messageId);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEmail();