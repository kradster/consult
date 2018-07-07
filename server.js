const express = require('express');
const app = express();

let session = require('express-session');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let cookieparser = require('cookie-parser');
let bcrypt = require('bcrypt-nodejs');
let nodemailer = require('nodemailer');
let Config = require('./config.json');

//for parsing application/xwww
app.use(bodyParser.urlencoded({ extended: true }));
//for parsing application/json
app.use(bodyParser.json());
//for parsing multipart/form-data
app.use(upload.array());

app.use(session({ secret: Config.SESSION_KEY }));
//app.use(cookieparser);

//serve all static folders
app.use(express.static('css'));
app.use('/img', express.static('img'));
app.use('/myfont', express.static('myfont'));
app.use('/templates', express.static('templates'));
app.use('/js', express.static('js'));

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
            skills
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS JobListings(
            jobtitle text,
            recruiteremail text,
            companyname text,
            aboutcompany text,
            location text,
            minsal text,
            maxsal text,
            minexp text,
            maxexp text,
            jobdesc text,
            listbyemail text,
            altemail text
        );
    `);

});

let smtptransport = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
        user: Config.USER,
        pass: Config.PASS
    }
});
let rand, mailoptions, host, link;

app.get('/send', (req, res) => {
    rand = Math.floor((Math.random() * 100) + 54);
    host = req.get('host');
    link = "http://" + req.get('host') + "/verify?id=" + rand;
    mailoptions = {
        from: Config.EMAIL_ADDRESS,
        to: req.body.email,
        subject: "Confirm your e-mail account",
        html: "Hello,<br> Please click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
    };
    smtptransport.sendMail(mailoptions, (err, response) => {
        if (err) {
            console.log(err);
            res.end("error");
        } else {
            res.end("Message sent:", response.message);
            res.end('sent');
        }
    });
});

app.get('/verify', (req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if (req.query.id == rand) {
            console.log("email is verified");
            res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
            db.exec("UPDATE TABLE Users SET verified=")
        } else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
});

app.post('/signup', (req, res) => {
    console.log("signup", req.body);
    data = req.body;
    if (!data.firstname || !data.lastname || !data.phoneno || !data.email || !data.password || !data.cpassword)
        return res.send({ success: false, message: "Error, one or more fields are empty." });
    if (data.password !== data.cpassword)
        return res.send({ success: false, message: "Error, passwords dont match" });
    db.get("SELECT * FROM Users WHERE email = ?", data.email, (err, row) => {
        if (row) return res.send({ success: false, message: "The account associated with the email already exists." });
    });
    delete data.cpassword;
    data["uniqueid"] = Date.now();
    data["verified"] = "no";
    data.password = bcrypt.hashSync(data.password);
    //console.log(data);
    sql = "INSERT INTO Users(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";

    db.exec(sql, err => {
        if (err) return res.send(err);
        res.send({ success: true, message: "Account created" });


        setTimeout(() => {
            res.redirect('/login');
        }, 3000);
    });
    //    res.send(req.body);
});

app.post('/login', (req, res) => {

    console.log('trying to log in...');
    db.get("SELECT * FROM Users WHERE email = ?", req.body.email, (err, row) => {
        if (!row) {
            console.log("0 rows found, no user");
            res.cookie('userid', null);
            return res.send({ success: false, message: 'Error, No such user exists' });
        }
        //console.log(row);
        if (!bcrypt.compareSync(req.body.password, row.password))
            return res.send({ success: false, message: "Err  or, Incorrect password." });

        e = { expires: new Date(Date.now() + 1000 * 60 * 24) };

        req.session.user = row.uniqueid;
        console.log('Logged in');
        res.cookie('uniqueid', row.uniqueid, e);
        return res.redirect('/templates/profile.html');
    });
    //res.send('TODO');
});

app.post('/cvbuilder', (req, res) => {
    if (!req.session.user) return res.redirect('/templates/login.html');
    console.log("session", req.session.user);
    console.log("cv details", req.body);
    data = req.body;
    data.projects = data.projects.join(", ");
    data.skills = data.skills.join(" ");
    data["uniqueid"] = req.session.user;
    sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
    console.log(sql);
    db.exec(sql, err => {
        if (err) return res.send(err);
        return res.send({ success: true, message: "Successfully entered all values" }).redirect('/templates/profile.html');
    });

    //res.send({ success: true, data: req.body, message: "cv details" });
});

app.get('/getcv', (req, res) => {
    if (!req.session.user) return res.send({ success: false, message: "You need to login first" });
    db.get("SELECT * FROM CV WHERE uniqueid = ?", req.session.user, (err, row) => {
        if (!row) {
            console.log("No id found");
            return res.send({ success: false, message: "No such userid exists in the database" });
        }
        console.log("Fetching cv details for", req.session.user);
        return res.send({ success: true, data: row });
    });
});

app.post('/addjob', (req, res) => {

    data = req.body;
    sql = "INSERT INTO JobListings(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
    console.log(sql);
    db.exec(sql, err => {
        if (err) return res.send(err);
        return res.send({ success: true, message: "Job Listing added" });
    });
    //res.send(req.body);
});

app.get('/getjoblistings', (req, res) => {
    db.all("SELECT * FROM JobListings", (err, row) => {
        if (!row) {
            console.log("No rows found");
            return res.send({ success: false, message: "0 job listings" });
        }
        console.log("Fetching job listings...", row.length, "rows found");
        return res.send({ success: true, data: row });
    });
});

app.get('/adminpanel', (req, res) => {
    if (req.session.user === "") {
        res.sendFile('/templates/adminpanel.html', { root: __dirname });
    } else
        res.redirect('/login');
});

app.post('/adminpanel', (req, res) => {
    if (req.session.user === "") {
        db.all('SELECT * FROM JobListings', (err, row) => {
            res.send({ success: true, data: row });

        });
    } else
        res.send({ success: false, message: "Incorrect login" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('listening on : ' + (process.env.PORT || 3000));
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/logout', (req, res) => {
    res.cookie('uniqueid', "null");
    req.session = null;
    return res.redirect('/');
});

app.get('/signup', (req, res) => {
    res.sendFile('/templates/signup.html', { root: __dirname });
});
app.get('/login', (req, res) => {
    res.sendFile('/templates/login.html', { root: __dirname });
});

app.get('/schedule', (req, res) => {
    res.sendFile('/templates/schedule.html', { root: __dirname });
});
app.get('/recruiters', (req, res) => {
    res.sendFile('/templates/recruiters.html', { root: __dirname });
});
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/profile.html', { root: __dirname });
});
app.get('/jobs', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/comlist.html', { root: __dirname });
});

app.post('/showcv', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/showcv.html', { root: __dirname });
});
app.post('/myscore', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/myscore.html', { root: __dirname });
});
app.post('/myjob', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/myjob.html', { root: __dirname });
});
app.post('/editcv', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/makecv.html', { root: __dirname });
});

app.get('*', (req, res) => {
    res.send('404 Page Not Found.');
});

// function setCookies(res, row, expiry = 0) {
//     if (row.hasOwnProperty('password')) delete row.password;
//     for (let key in row)
//         if (row[key]) res.cookie(key, row[key], expiry);
//         else res.cookie(key, "", expiry);
//     return res;
// }