"use strict";
const express = require('express');
const app = express();
var path = require('path');
let session = require('express-session');
let bodyParser = require('body-parser');
let multer = require('multer');
let cookieparser = require('cookie-parser');
let nodemailer = require('nodemailer');
let Config = require('./config');
let mainRouter = require('./routes/main.js');
let authRouter = require('./routes/auth.js');
let adminRouter = require('./routes/admin.js');
let recruiterRouter = require('./routes/recruiter.js');
let paymentRouter = require('./routes/payment.js');
var fileUpload = require('express-fileupload');
var passport = require('passport');
var mongoose = require('mongoose');

// Mongoose
mongoose.connect('mongodb://localhost/joblana');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// Mongoose

//serve all static folders
app.use('/css', express.static('static/css'));
app.use('/img', express.static('static/img'));
app.use('/myfont', express.static('static/myfont'));
app.use('/templates', express.static('static/templates'));
app.use('/js', express.static('static/js'));
app.use('/downloads', express.static('static/downloads'));
//app.use('/static/templates/admin', express.static('admin'));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({limits: { fileSize: 1 * 1024 * 1024}, safeFileNames: true, preserveExtension: true }));
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');
app.set('trust proxy', 'loopback');
app.use(session({
    secret: Config.SESSION_KEY,
    saveUninitialized: true,
    resave: false,
    cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 1800000, //30 mins
        secure: Config.SESSION_COOKIE_SECURE,
    }
}));
require('./passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
// Middlewares
app.use(function(req, res, next) {
    if (!req.session.messages) {
        req.session.messages = [];
    }
    res.locals.removeMessages = function() {
        req.session.messages = [];
        res.locals.messages = [];
    };
    res.locals.link = function(view, namespace) {
        if (namespace) {
            let url = "/" + namespace + "/" + view;
            return url;
        } else {
            let url = "/" + view;
            return url;
        }
    }
    if (req.session.messages) {
        res.locals.messages = req.session.messages;
    }
    next();
});
// Routes
app.use('/', mainRouter);
app.use('/user', authRouter);
app.use('/admin', adminRouter);
app.use('/payment', paymentRouter);
app.use('/recruiter', recruiterRouter);
// Routes

// 404 Page redirect
app.get('*', (req, res, next) => {
    if (req.session.messages) {
        req.session.messages.push(["The page you are looking for doesn't exist", "red"])
    } else {
        req.session.messages = [
            ["The page you are looking for doesn't exist", "red"]
        ]
    }
    res.redirect('/');
});
// 404 Page redirect

app.listen(Config.PORT || 5000, Config.HOST || "0.0.0.0", () => {
    console.log('listening on ' + (Config.HOST || "0.0.0.0") + ": " + (Config.PORT || 5000));
});