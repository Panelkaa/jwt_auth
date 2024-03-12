const nodemailer = require('nodemailer');
require('dotenv').config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const OAuth2_client = new OAuth2(process.env.clientId, process.env.clientSecret);


class MailService {
    
    constructor() {
        
        this.transporter = nodemailer.createTransport({
            service: "Gmail",
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.MAIL_PASSWORD,          
            },
        })
    }


    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER, 
            to, 
            subject: 'Активация аккаунта на ' + process.env.API_URL, 
            text: '', 
            html: 
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
          }, 
          function (er, success) {
            console.log(er,success)        
          }
          );
    }
    
}

module.exports = new MailService();