const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER || 'UccEmprendedores@gmail.com',
    pass: process.env.EMAIL_PASS || 'gwkh ymon mvum bjmo'
  },
  tls: {
    rejectUnauthorized: false // Ayuda a evitar problemas con certificados en algunos servidores
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: '"MPE SYSTEM - UCC" <UccEmprendedores@gmail.com>',
    to: email,
    subject: 'Código de Verificación - MPE SYSTEM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #1e3a5f; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MPE SYSTEM</h1>
        </div>
        <div style="padding: 40px; text-align: center; background: white;">
          <h2 style="color: #1e293b; margin-top: 0;">Tu código de seguridad</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.5;">Para completar el inicio de sesión, usa el siguiente código de 6 dígitos. Este código expirará en <strong>2 minutos</strong>.</p>
          <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; margin: 32px 0; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a5f; border: 2px dashed #cbd5e1;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Si no solicitaste este código, por favor ignora este correo.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 Universidad Cooperativa de Colombia</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
