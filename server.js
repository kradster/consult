const express = require('express');
const app = express();

let session = require('express-session');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let cookieparser = require('cookie-parser');
let bcrypt = require('bcrypt-nodejs');

//for parsing application/xwww
app.use(bodyParser.urlencoded({ extended: true }));
//for parsing application/json
app.use(bodyParser.json());
//for parsing multipart/form-data
app.use(upload.array());

app.use(session({ secret: 'kljk' }));
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
            phoneno text NOT NULL
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

app.post('/signup', (req, res) => {
    console.log("signup", req.body);
    data = req.body;
    if (!data.firstname || !data.lastname || !data.phoneno || !data.email || !data.password || !data.cpassword)
        return res.send({ success: false, message: "Error, one or more fields are empty." });
    if (data.password !== data.cpassword)
        return res.send({ success: false, message: "Error, passwords dont match" });

    delete data.cpassword;
    data["uniqueid"] = Date.now();
    data.password = bcrypt.hashSync(data.password);

    //console.log(data);
    sql = "INSERT INTO Users(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";

    db.exec(sql, err => {
        if (err) return res.send(err);
        return res.send({ success: true, message: "Account created" });
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
    if (!req.session.user) return res.redirect('/login.html');
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
        return res.send({ success: true, message: "Successfully entered all values" }).redirect('/profile.html');
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

app.listen(process.env.PORT || 3000, () => {
    console.log('listening on : ' + (process.env.PORT || 3000));
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('*', (req, res) => {
    res.send('404 Page Not Found.');
});

function setCookies(res, row, expiry = 0) {
    if (row.hasOwnProperty('password')) delete row.password;
    for (let key in row)
        if (row[key]) res.cookie(key, row[key], expiry);
        else res.cookie(key, "", expiry);
    return res;
}