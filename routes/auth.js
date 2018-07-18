const express = require('express');
var authRouter = express.Router();
var userController = require('../controllers/user')

var sendEmail = require('../utils/email');

function isauthenticated(req, res, next){
    if (!req.session.user) {
        req.session.messages.push(["Please login to access this page", "blue"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

authRouter.get('/profile', isauthenticated, (req, res) => {
    let dct = { title: "Dashboard"};
    userController.userdata(req.session.user, (err, response) =>{
        if (response.success == true){
            dct.data = response.data;
            console.log(dct);
            dct.data["_removetags"] = true;
            return res.render("auth/profile", dct);
        }
        else{
            res.locals.messages.push([response.message, "red"]);
            return res.redirect('/')
        }
    })
});

authRouter.get('/showcv', isauthenticated, (req, res) => {
    let dct = { title: "View Cv"};
    return res.render("auth/showcv", dct);
});

authRouter.get('/myscore', isauthenticated, (req, res) => {
    let dct = { title: "My Score"};
    return res.render("auth/myscore", dct);
});

authRouter.get('/myjob', isauthenticated, (req, res) => {
    let dct = { title: "View Cv"};
    return res.render("auth/myjob", dct);
});

authRouter.get('/editcv', isauthenticated, (req, res) => {
    let dct = { title: "Edit Cv"};
    return res.render("auth/makecv", dct);
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
    let data = req.body;
    if (!data.firstname || !data.lastname || !data.phoneno || !data.email || !data.password || !data.cpassword){
        res.locals.messages.push(["One or more fields are empty", "red"])
        return res.redirect('/signup');
    }
    if (data.password !== data.cpassword){
        res.locals.messages.push(["Passwords do not match", "red"])
        return res.redirect('/signup');
    }
    userController.createuser(data, (err, response) => {
        if (err){
            console.error(err);
            res.locals.messages.push(["Some error found", "red"]);
            return res.redirect('/signup')
        }
        if (response.success == false){
            res.locals.messages.push([response.message, "red"]);
            return res.redirect('/signup')
        }
        else{
            sendEmail(data.email, "Welcome", {link: "https://www.joblana.com"}, "verification");
            res.locals.messages.push([response.message, "green"]);
            return res.redirect('/signup')
        }
    })
});

authRouter.post('/login', (req, res) => {

    console.log(req.session.next);
    if (!req.body.email){
        res.locals.messages.push(["One or more fields are incorrect", "red"])
        return res.redirect('/login');
    }
    userController.userlogin(req.body.email, req.body.password, (err, response) => {
        if(err){
            console.error(err.message);
            return
        }
        if (response.success == false){
            res.locals.messages.push([response.message, "red"])
            return res.redirect('/login');
        }
        req.session.user = response.user.uniqueid;
        req.session.email = response.user.email;
        res.locals.messages.push(["Successfully Logged in", "green"])
        if (req.session.next){
            let next = req.session.next;
            delete req.session.next;
            return res.redirect(next);
        }
        return res.redirect('/user/profile');
    });
    //res.send('TODO');
});

authRouter.post('/cvbuilder', isauthenticated, (req, res) => {
    data = req.body;
    userController.addcvdata(data, req.session.user, req.session.email, (err, response) => {
        if (err){
            console.log(err);
            req.session.messages.push([err.message, "red"])
            return res.redirect('/user/profile');
        }
        if (response.success == false){
            res.locals.messages.push([response.message, "red"])
            return res.redirect('/user/editcv');
        }
        else{
            res.locals.messages.push([response.message, "green"])
            return res.redirect('/user/profile');
        }
    })

    //res.send({ success: true, data: req.body, message: "cv details" });
});


// authRouter.get('/getcv', (req, res) => {
//     if (!req.session.user) return res.send({ success: false, message: "You need to login first" });
//     db.get("SELECT * FROM CV WHERE uniqueid = ?", req.session.user, (err, row) => {
//         if (!row) {
//             console.log("No id found");
//             return res.send({ success: false, message: "No such userid exists in the database" });
//         }
//         console.log("Fetching cv details for", req.session.user);
//         return res.send({ success: true, data: row });
//     });
// });

authRouter.post('/scheduletest', isauthenticated, (req, res) => {
    data = req.body;
    data["userid"] = req.session.user;
    sql = "INSERT INTO Tests(" + Object.keys(data).join(",") + ") VALUES('" + Object.values(data).join("', '") + "');";
    db.exec(sql, (err, row) => {
        if (err) console.log(err);
        return res.render('alert', { title: "Successfully booked for the test ", link: "/templates/profile.html", linkname: "Goto Profile" });
    });
});


authRouter.get('/logout', isauthenticated, (req, res) => {
    req.session.destroy();
    return res.redirect('/');
});

authRouter.post('/uploadresume', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.send(req.body);
});


module.exports = authRouter;