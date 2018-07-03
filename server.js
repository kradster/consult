const express = require('express');
const app = express();

let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();

let bcrypt = require('bcrypt-nodejs');

//for parsing application/xwww
app.use(bodyParser.urlencoded({ extended: true }));
//for parsing application/json
app.use(bodyParser.json());
//for parsing multipart/form-data
app.use(upload.array());

//serve all static folders
app.use(express.static('css'));
app.use('/img', express.static('img'));
app.use('/myfont', express.static('myfont'));
app.use("/signup.html", express.static('signup.html'));

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
    if (!req.body) return res.redirect('/login.html');
    console.log('trying to log in...', req.body);
    db.get("SELECT * FROM Users WHERE email = ?", req.body.email, (err, row) => {
        if (!row) {
            console.log("0 rows found");
            return res.send({ success: false, message: 'Error, No such user exists' });
        }
        //console.log(row);
        if (!bcrypt.compareSync(req.body.password, row.password))
            return res.send({ success: false, message: "Err  or, Incorrect password." });

        e = { expires: new Date(Date.now() + 1000 * 60 * 24) };
        console.log('Logged in', row);

        res = setCookies(res, row, e);
        return res.redirect('/makecv.html');
    });
    //res.send('TODO');
});

app.post('/cvbuilder', (req, res) => {
    console.log("cookies", req.cookies);
    console.log("cv details", req.body);
    e = { expires: new Date(Date.now() + 1000 * 60 * 24) };
    res = setCookies(res, req.body, e);
    res.send({ success: true, data: req.body, message: "cv details" });
});

app.get('/login.html', (req, res) => {
    res.sendFile('login.html', { root: __dirname });
});

app.get('/makecv.html', (req, res) => {
    res.sendFile('makecv.html', { root: __dirname });
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