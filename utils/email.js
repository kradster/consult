let nodemailer = require('nodemailer');
var ejs = require("ejs");
let Config = require('../config.json');
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

function sendVerificatonEmail(req, res) {
    rand = Math.floor((Math.random() * 10000000) + 342132);
    console.log("Sending verification email...");
    email = req.body.email || req.session.email;
    runtime_obj[rand] = email;
    console.log(runtime_obj);
    host = req.get('host');
    link = "http://joblana.com/verify?id=" + rand;

    let mailoptions = {
        from: Config.EMAIL_ADDRESS,
        to: email,
        subject: "Confirm your e-mail",
        text: "Hello, Please click on the link to verify your email. " + link,
        html: "<b>Hello</b>, <br> Please click on the link to verify your email. <br><a href=" + link + ">Click here to verify</a>",
    };

    transporter.sendMail(mailoptions, (err, info) => {
        if (err) return console.log(err);
        console.log('Message sent:', info.messageid);
        console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
    });

}

module.exports = sendEmail;