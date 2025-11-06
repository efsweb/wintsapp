const nodemailer = require('nodemailer');

const SERVICE_NAME = 'eliel@tsshara.com.br';
const ACCOUNT_NAME = 'smtp-credentials';

//mail-ssl-m9.network
//465

// Criando o transportador
const transporter = nodemailer.createTransport({
    host: 'mail-ssl-m9.network',  // Ou outro serviço como 'smtp.mailtrap.io'
    port: 465,
    secure: true,
    auth: {
        user: 'eliel@tsshara.com.br',
        pass: 'ea@lll19',
    },
});

// Configuração do e-mail
const mailOptions = {
    from: 'eliel@tsshara.com.br',
    to: 'eliel@tsshara.com.br',
    subject: 'NB Status',
    text: 'O Status do NB mudou',
};

export async function sendNotificationMail(){
    // Enviando o e-mail
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.log('Erro ao enviar e-mail:', error);
        } else {
            console.log('E-mail enviado: ' + info.response);
        }
    });

}
