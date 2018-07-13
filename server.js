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
        req.session.email = row.email;
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
    data["projects"] = data.projecttype.map((x, i) => {
        return data.projecttype[i] + ", " + data.projectrole[i] + ", " + data.projectinstitute[i] + ", " + data.projectdetails + ", " + data.projectstartdate + " to " + data.projectenddate;
    }).join(";\n");
    delete data.projecttype;
    delete data.projectrole;
    delete data.projectinstitute;
    delete data.projectdetails;
    delete data.projectstartdate;
    delete data.projectenddate;
    data.skills = data.skills.join(", ");
    data["uniqueid"] = req.session.user;
    console.log(data.projects, data.skills);
    let vals = Object.values(data).map(x => { if (typeof(x) == "string") return x.replace("'", "''") });
    sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";
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

app.get('/upcoming-jl-test', (req, res) => {
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
    //if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/comlist.html', { root: __dirname });
});
app.get('/about-joblana', (req, res) => {
    res.sendFile('/templates/about.html', { root: __dirname });
});
app.get('/faq-joblana', (req, res) => {
    res.sendFile('/templates/faq.html', { root: __dirname });
});
app.get('/contact-joblana', (req, res) => {
    res.sendFile('/templates/contact.html', { root: __dirname });
});
app.get('/why-joblana-jl-test', (req, res) => {
    res.sendFile('/templates/whyjl.html', { root: __dirname });
});
app.get('/joblana-recruiting-partners', (req, res) => {
    res.sendFile('/templates/partners.html', { root: __dirname });
});
app.get('/about-jl-test', (req, res) => {
    res.sendFile('/templates/jltest.html', { root: __dirname });
});
app.get('/how-it-works-joblana', (req, res) => {
    res.sendFile('/templates/how.html', { root: __dirname });
});
app.get('/joblana-sample-paper-jl-test', (req, res) => {
    res.sendFile('/templates/samplepaper.html', { root: __dirname });
});
app.get('/post-a-job-joblana', (req, res) => {
    res.sendFile('/templates/recruiters.html', { root: __dirname });
});
app.get('/freshers-job-listings', (req, res) => {
    res.sendFile('/templates/joblist.html', { root: __dirname });
});
app.get('/it-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/itjob.html', { root: __dirname });
});
app.get('/human-resources-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/hrjob.html', { root: __dirname });
});
app.get('/sales-and-marketing-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/smjob.html', { root: __dirname });
});
app.get('/accounting-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/accjob.html', { root: __dirname });
});
app.get('/digital-marketing-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/dmjob.html', { root: __dirname });
});
app.get('/office-support-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/osjob.html', { root: __dirname });
});
app.get('/calling-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/.html', { root: __dirname });
});
app.get('/operations-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/opjob.html', { root: __dirname });
});
app.get('/privacy-policy', (req, res) => {
    res.sendFile('/templates/policy.html', { root: __dirname });
});
app.get('/job-opportunities', (req, res) => {
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

app.post('/uploadresume',(req, res)=>{
    if (!req.session.user) return res.redirect('/login');
    res.send(req.body);
});


app.get('*', (req, res) => {
    res.render('alert', { title: "404. The page you are looking for doesn't exist", link: "/", linkname: "Go back to home" });
});


let smtptransport = nodemailer.createTransport({
    host: 'smtp.elasticmail.com',
    port: 2525,
    secure: false,
    auth: {
        user: Config.USER,
        pass: Config.PASS
    }
});

let rand, mailoptions, host, link;
let runtime_obj = {};

//sendVerificatonEmail({ body: { email: "priyanshbalyan@gmail.com" } });

function sendVerificatonEmail(req, res) {
    rand = Math.floor((Math.random() * 10000000) + 342132);
    console.log("Sending verification email...");
    runtime_obj[rand] = req.body.email;
    console.log(runtime_obj);
    host = req.get('host');
    link = "http://" + req.get('host') + "/verify?id=" + rand;
    //link = "asa";
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

//render engine
let fs = require('fs');

app.set('views', './render');
app.set('view engine', 'html');

app.engine('html', (filepath, options, callback, array = null) => {
    fs.readFile(filepath, (err, content) => {
        if (err) return callback(err);
        let rendered = content.toString();
        //console.log("trigger", options.data);
        console.log
        for (let key in options) {
            if (options.hasOwnProperty(key) && key != "settings" && key != "_locals" && key != "cache") {
                rendered = rendered.replace(new RegExp('{{ ' + key + ' }}', 'gi'), options[key]); //replace all {{ key }} case insensitive
            }
        }

        return callback(null, rendered);
    });
});