const { sendOTP } = require('../config/mailer');

async function testMail() {
  console.log('🚀 Probando envío de correo a afsr1232018@gmail.com...');
  try {
    const info = await sendOTP('afsr1232018@gmail.com', '123456');
    console.log('✅ Correo enviado con éxito!');
    console.log('ID del mensaje:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
}

testMail();
