let nodemailer = require('nodemailer');
var ejs = require("ejs");
let Config = require('../config');
var path = require('path');


let transporter = nodemailer.createTransport({
    host: 'smtp.elasticemail.com',
    port: 2525,
    secure: false,
    auth: {
        user: Config.USER,
        pass: Config.PASS
    }
});

transporter.verify(function(error, success) {
    if (error) console.log(error);
    else console.log('E-mail server ready.');
});

function sendEmail(email, subject, data, file) {
    if (!Config.SEND_EMAIL) {
        console.log('Sending no email')
        return
    } 
    ejs.renderFile(path.join(__dirname, "../views/email/") + file + ".ejs", data, function (err, html) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: Config.EMAIL_ADDRESS,
                to: email,
                subject: subject,
                html: html
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
    });
}

module.exports = sendEmail;