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
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/signup')
            } else {
                userController.createtoken(user, (err, token) => {
                    sendEmail(user.email, "Welcome", { link: "http://127.0.0.1:5000/user/verify-email/" + token.token }, "verification");
                })
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
    data.verified = req.user.verified? "Verified": "Unverified" ;
    dct.data = data;
    dct.data.profile = {details: {}, address: {}, education: {high: {}, intermediate: {}, graduation: {}, post_graduation: {}}, experience: [], skills: []};
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
    let profile = req.user.profile ? req.user.profile : {details: {}, address: {}, education: {high: {}, intermediate: {}, graduation: {}, post_graduation: {}}, experience: [], skills: []};
    let dct = { title: "Edit Cv", user: req.user, profile: profile };
    return res.render("auth/makecv", dct);
});

authRouter.post('/editcv', isauthenticated, (req, res, next) => {
    data = req.body;
    userController.addprofile(req.user, data, (err, response) => {
        try {
            if (err) {
                messages = [];
                Object.keys(err.errors).forEach(error => {
                    messages.push([err.errors[error].message, "red"]);
                });
                return res.send({success: true, messages: messages})
            } else {
                return res.send({success: true, messages: [["Profile updated successfully", "green"]]})
            }
        } catch (error) {
            console.error(error)
        }
    });

    //res.send({ success: true, data: req.body, message: "cv details" });
});


authRouter.get('/verify-email/:token', (req, res) => {
    let token = req.params.token;
    userController.verifytoken(token, (err, response) => {
        if (err){
            console.log(err)
            return res.redirect('/')
        }
        if (response) {
            res.locals.messages.push(["Your email has been verified successfully", "green"])
            return res.redirect('/')
        }
        else{
            res.locals.messages.push(["Invalid link or expired", "red"])
            return res.redirect('/')
        }
    })

});

authRouter.get('/resend-email', isauthenticated, (req, res, next) => {
    if (req.user.verified){
        res.locals.messages.push(["Your email is verified", "green"]);
        return res.redirect('/user/profile')
    }
    userController.createtoken(req.user, (err, token) => {
        res.locals.messages.push(["A verification link has been sent to your email. Please check your mail.", "green"])
        sendEmail(req.user.email, "Welcome", { link: "http://127.0.0.1:5000/user/verify-email/" + token.token }, "verification");
        return res.redirect('/')
    })
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