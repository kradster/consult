const express = require('express');
var path = require('path');
template = path.join(__dirname, '../static/templates');
var authRouter = express.Router();

authRouter.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/profile.html', { root: __dirname });
});

authRouter.post('/showcv', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/showcv.html', { root: __dirname });
});

authRouter.post('/myscore', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/myscore.html', { root: __dirname });
});

authRouter.post('/myjob', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/myjob.html', { root: __dirname });
});

authRouter.post('/editcv', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile('/templates/makecv.html', { root: __dirname });
});


authRouter.get('/verify', (req, res) => {
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

authRouter.get('/resendemail', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    sendVerificatonEmail(req, res);
    return res.render('alert', { title: "A verification link has been sent to your email. Please check your mail.", link: "/", linkname: "Go to Home" });
});

authRouter.post('/signup', (req, res) => {
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

authRouter.post('/login', (req, res) => {

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


authRouter.post('/cvbuilder', (req, res) => {
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


authRouter.get('/getcv', (req, res) => {
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

authRouter.get('/profile', (req, res) => {
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

authRouter.post('/scheduletest', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    data = req.body;
    data["userid"] = req.session.user;
    sql = "INSERT INTO Tests(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
    db.exec(sql, (err, row) => {
        if (err) console.log(err);
        return res.render('alert', { title: "Successfully booked for the test ", link: "/templates/profile.html", linkname: "Goto Profile" });
    });
});


authRouter.get('/logout', (req, res) => {
    res.cookie('uniqueid', "null");
    req.session = null;
    return res.redirect('/');
});

module.exports = authRouter;