const express = require('express');
var authRouter = express.Router();
var userController = require('../controllers/user')
var passport = require('passport');
var sendEmail = require('../utils/email');

// Middlewares
function isauthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.messages.push(["Please login to access this page", "blue"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}
// Middlewares

authRouter.post('/login', (req, res, next) => {
    passport.authenticate('local-login', {
        successRedirect: '/user/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
    })(req, res, next);
});

authRouter.post('/signup', (req, res) => {
    let data = req.body;
    if (!data.password || !data.cpassword || (data.password !== data.cpassword)) {
        res.locals.messages.push(["Passwords do not match", "red"])
        return res.redirect('/signup');
    }
    userController.createuser(data, (err, user) => {
        try {
            if (err) {
                console.log('errror')
                console.error(err);
                Object.values(err.errors).forEach(error => {
                    console.log(error.message);
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/signup')
            } else {
                console.log(user);
                sendEmail(user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Successful signup", "green"]);
                return res.redirect('/login')
            }
        } catch (error) {
            console.error(error)
        }
    })
});

authRouter.get('/profile', isauthenticated, (req, res) => {
    let dct = { title: "Dashboard" };
    let data = new Object();
    data.fullname = req.user.fullname
    data.email = req.user.email;
    data.phoneno = req.user.phoneno;
    data.verified = req.user.verified;
    dct.data = data;
    dct.data["_removetags"] = true;
    dct.data.profile = {details: {}, address: {}, education: {high: {}, intermediate: {}, graduation: {}}};
    userController.getUserProfile(req.user, (err, profile) => {
        if (err){
            console.error(err);
            return res.render("auth/profile", dct);
        }
        if (profile) {
            dct.data.profile = profile;
        }
        return res.render("auth/profile", dct);
    });
});

authRouter.get('/showcv', isauthenticated, (req, res) => {
    let dct = { title: "View Cv" };
    return res.render("auth/showcv", dct);
});

authRouter.get('/myscore', isauthenticated, (req, res) => {
    let dct = { title: "My Score" };
    return res.render("auth/myscore", dct);
});

authRouter.get('/myjob', isauthenticated, (req, res) => {
    let dct = { title: "View Cv" };
    return res.render("auth/myjob", dct);
});

authRouter.get('/editcv', isauthenticated, (req, res) => {
    let dct = { title: "Edit Cv" };
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

authRouter.get('/resendemail', (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    sendVerificatonEmail(req, res);
    return res.render('alert', { title: "A verification link has been sent to your email. Please check your mail.", link: "/", linkname: "Go to Home" });
});




authRouter.post('/cvbuilder', isauthenticated, (req, res, next) => {
    data = req.body;
    console.log(data);
    userController.addprofile(req.user, data, (err, response) => {
        try {
            if (err) {
                console.log('errror')
                console.error(err);
                Object.keys(err.errors).forEach(error => {
                    console.log(err.errors[error].message);
                    res.locals.messages.push([err.errors[error].message, "red"]);
                });
                return res.redirect('/user/profile')
            } else {
                res.locals.messages.push(["Profile updated successfully", "green"]);
                return res.redirect('/user/profile')
            }
        } catch (error) {
            console.error(error)
        }
    });

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
    req.logout();
    return res.redirect('/');
});

authRouter.post('/uploadresume', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.send(req.body);
});


module.exports = authRouter;