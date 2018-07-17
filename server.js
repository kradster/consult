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
        maxAge:  1800000,  //30 mins
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


app.get('/verify', (req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if (runtime_obj.hasOwnProperty(req.query.id)) {
            email = runtime_obj[req.query.id];
            db.exec("UPDATE Users SET verified='yes' WHERE email = '" + email + "'", err => {
                if (err) console.log(err);
                console.log("email is verified");
                return res.render('alert', { title: "Successfully verified your E-mail", link: "/login", linkname: "Login" });
            });
        } else {
            console.log("email is not verified");
            return res.render('alert', { title: 'Link expired.', link: "/", linkname: "Go to Home" });
        }
    } else return res.render('alert', { title: 'Bad request', link: "/", linkname: "Go to Home" });
});

app.get('/resendemail', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    sendVerificatonEmail(req, res);
    return res.render('alert', { title: "A verification link has been sent to your email. Please check your mail.", link: "/", linkname: "Go to Home" });
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
            db.exec("INSERT INTO CV(uniqueid) VALUES('" + data.uniqueid + "')", (err, row) => {
                if (err) return res.send(err);
                res.redirect('/login');
            });
        });
    });
    //    res.send(req.body);
});

app.post('/login', (req, res) => {

    console.log('trying to log in...');
    db.get("SELECT * FROM Users WHERE email = ?", req.body.email, (err, userrow) => {
        if (!userrow) {
            console.log("0 rows found, no user");
            res.cookie('userid', null);
            return res.render('alert', { title: "One or more fields are incorrect", link: "/login", linkname: "Go Back" });
        }
        //console.log(row);
        if (!bcrypt.compareSync(req.body.password, userrow.password))
            return res.render('alert', { title: "Incorrect password", link: "/login", linkname: "Go Back" });

        e = { expires: new Date(Date.now() + 1000 * 60 * 24) };

        req.session.user = userrow.uniqueid;
        req.session.email = userrow.email;
        console.log('Logged in');
        res.cookie('uniqueid', userrow.uniqueid, e);
        res.redirect('/profile');
    });
    //res.send('TODO');
});


app.post('/cvbuilder', (req, res) => {
    if (!req.session.user) return res.redirect('/templates/login.html');
    console.log("session", req.session.user);
    console.log("cv details");
    data = req.body;

    data["projects"] = data.projecttype.map((x, i) => {
        return data.projecttype[i] + ", " + data.projectrole[i] + ", " + data.projectinstitute[i] + ", " + data.projectdetails[i] + ", " + data.projectstartdate[i] + " to " + data.projectenddate[i];
    }).join(";\n");
    delete data.projecttype;
    delete data.projectrole;
    delete data.projectinstitute;
    delete data.projectdetails;
    delete data.projectstartdate;
    delete data.projectenddate;
    data.skills = data.skills.join(", ");
    data["email"] = req.session.email;
    console.log(data);
    let keys = Object.keys(data);
    let vals = Object.values(data).map(x => { if (typeof(x) == "string") return x.replace("'", "''") });
    sql = [];
    for (let i = 0; i < keys.length; i++)
        sql.push(keys[i] + " = '" + vals[i] + "'");
    sql = "UPDATE CV SET " + sql.join(", ") + " WHERE uniqueid = '" + req.session.user + "'";
    //sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";
    console.log(sql);
    db.exec(sql, err => {
        if (err) return res.send(err);
        return res.render('alert', { title: "Successfully entered all values", link: "/profile", linkname: "Goto Profile" });
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

app.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    db.get("SELECT * FROM Users WHERE email = ?", req.session.email, (err, userrow) => {
        if (err) return console.log(err);
        db.get('SELECT * FROM CV WHERE uniqueid = ?', userrow.uniqueid, (err, cvrow) => {
            if (err) console.log(err);
            if (!cvrow) return res.render('profile', {});
            data = cvrow;
            data["contactno"] = userrow.phoneno;
            data["verified"] = userrow.verified == "yes" ? "E-mail is verified." : "E-mail not verified. <a href='/resendemail'>Resend verification E-mail</a>";
            //  console.log(cvrow);
            data["_removetags"] = true;
            console.log(data);
            return res.render('profile', data);
        });
    });
});

app.post('/subscribe', (req, res) => {

    if (req.body.subscriptionemail)
        if (req.body.subscriptionemail != "") {
            db.exec("INSERT INTO JobAlerts(email) VALUES('" + req.body.subscriptionemail + "')", (err, row) => {
                if (err) console.log(err);
                return res.render('alert', { title: "Subscribed to Joblana Job Alerts!!", link: '/', linkname: 'Go back to home' });
            });
        }
});

app.post('/adminlogin', (req, res) => {
    if (req.body.password === Config.ADMIN_KEY) {
        req.session.admin = "admin" + Config.ADMIN_KEY;
        res.redirect('/admin');
    } else
        res.render('alert', { title: "Incorrect login attempt", link: "/", linkname: "Go back to home" });
});

app.get('/admin', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.sendFile('/admin/adminpanel.html', { root: __dirname });
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
        data["listingid"] = Date.now() + "";
        data["approved"] = "no";
        let vals = Object.values(data).map(x => x.replace("'", "''"));
        sql = "INSERT INTO JobListings(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";

        console.log(sql);
        //console.log(req.body);
        db.exec(sql, err => {
            if (err) return res.render('alert', { title: err + "", link: "/", linkname: "Goto home" });
            console.log('Job Listing added');
            return res.render('alert', { title: "Job Listing added", link: "/jobs", linkname: "Goto Jobs" });
        });
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
});

app.get('/admin/editjobs', (req, res) => {
    db.all("SELECT * FROM JobListings", (err, rows) => {
        console.log("Fetched ", rows.length, "rows");
        rows = rows.slice(0, 3);
        res.render('comlist', { data: rows });
    });

});

app.get('/admin/download', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.download(process.cwd() + '/database.db');
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
})

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

app.post('/scheduletest', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    data = req.body;
    data["userid"] = req.session.user;
    sql = "INSERT INTO Tests(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
    db.exec(sql, (err, row) => {
        if (err) console.log(err);
        return res.render('alert', { title: "Successfully booked for the test ", link: "/templates/profile.html", linkname: "Goto Profile" });
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

app.listen(Config.PORT || 5000, Config.HOST || "0.0.0.0", () => {
    console.log('listening on ' + (Config.HOST || "0.0.0.0") + ": " + (Config.PORT || 5000));
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/logout', (req, res) => {
    res.cookie('uniqueid', "null");
    req.session = null;
    return res.redirect('/');
});

app.use('/', mainRouter);

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
