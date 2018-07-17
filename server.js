const express = require('express');
const app = express();
var path = require('path');

let session = require('express-session');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let cookieparser = require('cookie-parser');
let bcrypt = require('bcrypt-nodejs');
let nodemailer = require('nodemailer');
let Config = require('./config.json');

let mainRouter = require('./routes/main.js');
//for parsing application/xwww
app.use(bodyParser.urlencoded({ extended: true }));
//for parsing application/json
app.use(bodyParser.json());
//for parsing multipart/form-data
app.use(upload.array());

app.set('views', path.join(__dirname, 'views/pages'));

let fs = require('fs');

app.set('view engine', 'ejs');

app.use(session({
    secret: Config.SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
        path: "/",
        httpOnly: true,
        maxAge: 1800000, //30 mins
        secure: Config.SESSION_COOKIE_SECURE,
    }
}));
//app.use(cookieparser);

//serve all static folders
app.use('/css', express.static('static/css'));
app.use('/img', express.static('static/img'));
app.use('/myfont', express.static('static/myfont'));
app.use('/templates', express.static('static/templates'));
app.use('/js', express.static('static/js'));
app.use('/downloads', express.static('static/downloads'));
//app.use('/static/templates/admin', express.static('admin'));

app.use('/', mainRouter);


//Connecting to local database
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('database.db', err => {
    if (err) return console.error(err.message);
    console.log('Connected to database.db SQLite3 Local Database');
    db.exec(`
        CREATE TABLE IF NOT EXISTS Users ( 
            uniqueid text PRIMARY KEY,
            firstname text NOT NULL,
            lastname text NOT NULL,
            email text NOT NULL,    
            password text NOT NULL,
            phoneno text NOT NULL,
            verified text NOT NULL
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS CV ( 
            uniqueid text PRIMARY KEY,
            fullname text,
            fathersname text,
            dob text,    
            city text,
            aadharno text,
            school10 text,
            board10 text,
            marks10 text,
            school12 text,
            board12 text,
            marks12 text,
            collegename text,
            collegeboard text,
            collegemarks text,
            projects text,
            skills text
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS JobListings(
            jobtitle text,
            recruiteremail text,
            companyname text,
            aboutcompany text,
            location text,
            minexp text,
            maxexp text,
            jobdesc text,
            listbyemail text,
            altemail text,
            contactno text,
            companywebsite text,
            noofvac text,
            salary text,
            experience text,
            anytime text,
            dateofjoin text,
            listingid text,
            approved text
        );
    `);
});


app.listen(Config.PORT || 5000, Config.HOST || "0.0.0.0", () => {
    console.log('listening on ' + (Config.HOST || "0.0.0.0") + ": " + (Config.PORT || 5000));
});

app.post('/uploadresume', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.send(req.body);
});


app.get('*', (req, res) => {
    res.render('alert', { title: "404. The page you are looking for doesn't exist", link: "/", linkname: "Go back to home" });
});

let rand, host, link = "sada";
let runtime_obj = {};

//sendVerificatonEmail({ body: { email: "priyanshbalyan@gmail.com" } });
