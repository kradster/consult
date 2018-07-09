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
//app.use('/admin', express.static('admin'));


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
            anytime text
            dateofjoin text
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
let runtime_obj = {};

app.get('/verify', (req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if (runtime_obj.hasOwnProperty(req.query.id)) {
            console.log("email is verified");
            email = runtime_obj[req.query.id];
            db.exec("UPDATE Users SET verified='yes' WHERE email=?", email, err => {
                res.end("<h1>Email " + mailOptions.to + " has been Successfully verified");
            });
        } else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    } else res.end('<h1>Bad request</h1>');
});

app.post('/signup', (req, res) => {
    console.log("signup");
    data = req.body;
    if (!data.firstname || !data.lastname || !data.phoneno || !data.email || !data.password || !data.cpassword)
        return res.send({ success: false, message: "Error, one or more fields are empty." });
    if (data.password !== data.cpassword)
        return res.send({ success: false, message: "Error, passwords dont match" });
    db.get("SELECT * FROM Users WHERE email = ?", data.email, (err, row) => {
        if (row) return res.send({ success: false, message: "The account associated with the email already exists." });
        delete data.cpassword;
        data["uniqueid"] = Date.now();
        data["verified"] = "no";
        data.password = bcrypt.hashSync(data.password);
        //console.log(data);
        sql = "INSERT INTO Users(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
        db.exec(sql, err => {
            if (err) return res.send(err);
            sendVerificatonEmail(req, res);
            console.log("Account created");
            res.redirect('/login');
        });
    });
    //    res.send(req.body);
});

app.post('/login', (req, res) => {

    console.log('trying to log in...');
    db.get("SELECT * FROM Users WHERE email = ?", req.body.email, (err, row) => {
        if (!row) {
            console.log("0 rows found, no user");
            res.cookie('userid', null);
            return res.render('alert', { title: "One or more fields are incorrect", link: "/login", linkname: "Go Back" });
        }
        //console.log(row);
        if (!bcrypt.compareSync(req.body.password, row.password))
            return res.render('alert', { title: "Incorrect password", link: "/login", linkname: "Go Back" });

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
        return res.render('alert', { title: "Successfully entered all values", link: "/templates/profile.html", linkname: "Goto Profile" });
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

app.post('/adminlogin', (req, res) => {
    if (req.body.password === Config.ADMIN_KEY) {
        req.session.admin = "admin" + Config.ADMIN_KEY;
        res.redirect('/admin/jobadd');
    } else
        res.render('alert', { title: "Incorrect login attempt", link: "/", linkname: "Go back to home" });
});

app.get('/admin/jobadd', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.sendFile('/admin/jobadd.html', { root: __dirname });
    } else
        res.redirect('/');

});

app.post('/addjob', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        data = req.body;
        sql = "INSERT INTO JobListings(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
        console.log(sql);
        console.log(req.body);
        db.exec(sql, err => {
            if (err) return res.send(err);
            return res.render('alert', { title: "Job Listing added", link: "/jobs", linkname: "Goto Jobs" });
        });
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
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

app.post('/getuserdata', (req, res) => {
    if (!req.body.uid) return res.send({ success: false, message: "Userid uid required" });
    db.get("SELECT * FROM Users WHERE uniqueid = ?", req.body.uid, (err, row) => {
        if (!row) return res.send({ success: false, message: 'No User with the particular id found' });
        data = row;
        delete data.password;
        db.get("SELECT * FROM CV WHERE uniqueid = ?", req.body.uid, (err, row) => {
            if (!row) return res.send({ success: true, data: data });
            data["CV"] = row;
            res.send({ success: true, data: data });
        });
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

function sendVerificatonEmail(req, res) {
    rand = Math.floor((Math.random() * 10000000) + 342132);
    console.log("Sending verification email...");
    runtime_obj[rand] = req.body.email;
    console.log(runtime_obj);
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
            console.log("Error sending verification email:", err);
        } else {
            console.log("Message sent:", response.message);
        }
    });
}
// function setCookies(res, row, expiry = 0) {
//     if (row.hasOwnProperty('password')) delete row.password;
//     for (let key in row)
//         if (row[key]) res.cookie(key, row[key], expiry);
//         else res.cookie(key, "", expiry);
//     return res;
// }

let fs = require('fs');

app.set('views', './templates');
app.set('view engine', 'html');

app.engine('html', (filepath, options, callback) => {
    fs.readFile(filepath, (err, content) => {
        if (err) return callback(err);
        let rendered = content.toString()
            .replace("{{ message }}", options.title)
            .replace("{{ link }}", options.link)
            .replace("{{ linkname }}", options.linkname);
        return callback(null, rendered);
    });
});