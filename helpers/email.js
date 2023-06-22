// send an email from notifications@magic-reservations.com
const nodemailer = require('nodemailer')
require ('dotenv').config()
const { getText, changeDateFormat } = require('./getText')





const messages = [
   {
    "type": "forgot-password",
    "subject": "Magic Reservations Password Reset",
    "body": "Hello, \n\nYou are receiving this email because you (or someone else) have requested the reset of the password for your account. \n\nPlease click on the following link, or paste this into your browser to complete the process: \n\n{url} \n\nIf you did not request this, please ignore this email and your password will remain unchanged. \n\nThank you, \n\nMagic Reservations"
    },
    {
    "type": "notification",
    "subject": "Reservations are available for {resort} on {date} at {park}!",
    "body": "Hello, \n\nReservations are available for {resort} on {date} at {park}! \n\nPlease click on the following link, or paste this into your browser to complete the process: \n\n{url} \n\nThank you, \n\nMagic Reservations"
    }
]



function buildBody (request){
    if (request.type === 'forgot-password'){
        const msg = messages.find(m => m.type === request.type)
        return msg.body.replace('{url}', request.url)
    } else if (request.type === 'notification'){
        const msg = messages.find(m => m.type === request.type)
        return msg.body.replace('{url}', request.url).replace('{resort}', getText(request.resort)).replace('{date}', changeDateFormat(request.date)).replace('{park}', getText(request.park))
    }
}

function buildSubject(request){
    const msg = messages.find(m => m.type === request.type)
    if (request.type === 'forgot-password'){
        return msg.subject
    } else if (request.type === 'notification'){
        return msg.subject.replace('{resort}', getText(request.resort)).replace('{date}', changeDateFormat(request.date)).replace('{park}', getText(request.park))
    }
}

async function sendEmail(request) {
    console.log(request)
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASS,
            
        },
    });

    console.log(transporter)
    let info = await transporter.sendMail({
        from: '"Magic Reservations" <notifications@magic-reservations.com>',
        to: request.bcc,
        subject: buildSubject(request),
        text: buildBody(request),
    });
    console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail
    
   
