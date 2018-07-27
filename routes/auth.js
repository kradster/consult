const express = require('express');
var authRouter = express.Router();
var userController = require('../controllers/user')
var storageController = require('../controllers/storage')
var passport = require('passport');
var sendEmail = require('../utils/email');
let User = require('../models/user.js');
var Config = require('../config')
var storage = require('../utils/storage');
let Profile = require('../models/profile');

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
    let next_url = req.session.next;
    delete req.session.next
    passport.authenticate('local-login', {
        successRedirect: next_url || '/user/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
    })(req, res, next);
});

authRouter.post('/signup', (req, res) => {
    let data = req.body;
    if (!data.password || !data.cpassword || (data.password !== data.cpassword)) {
        res.locals.messages.push(["Passwords do not match", "red"])
        return res.redirect('/signup');
    }
    if (!(data.role == "USER" || data.role == "RECRUITER")) {
        res.locals.messages.push(["Incorect Role", "red"])
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
                userController.createtoken(user, "VERIFY", (err, token) => {
                    sendEmail(user.email, "Welcome", { link: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/user/verify-email/" + token.token }, "verification");
                })
                res.locals.messages.push(["Successful signup. A verification email has been sent to your account.", "green"]);
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
    data.verified = req.user.verified;
    data.phoneno = req.user.phoneno;
    data.role = req.user.role;
    dct.data = data;
    dct.data.profile = { details: {}, address: {}, education: { high: {}, intermediate: {}, graduation: {}, post_graduation: {} }, experience: [], skills: [] };
    userController.getUserProfile(req.user, (err, profile) => {
        if (err) {
            console.error(err);
            return res.render("auth/profile", dct);
        }
        if (profile) {
            dct.data.profile = profile;
        }
        return res.render("auth/profile", dct);
    });
});

authRouter.post('/resume-upload', isauthenticated, function(req, res) {
    storageController.upload_file(req, res);
});

authRouter.get('/upcoming-jl-test', (req, res, next) => {
    let dct = { title: "Upcoming JL Tests | Schedule your JL test Now" };
    testController.getTests((err, tests) => {
        if (err) {
            dct['tests'] = []
        } else {
            if (tests) dct['tests'] = tests;
            else dct['tests'] = []

        }
        return res.render('auth/schedule', dct);
    });
});


authRouter.post('/scheduletest/:id', isauthenticated, (req, res) => {
    data = req.body
    let id = req.params.id;
    userController.addTest(req.user, id, data, (err, test) => {
        if (err) {
            Object.values(err.errors).forEach(error => {
                res.locals.messages.push([error.message, "red"]);
            });
            return res.redirect('/upcoming-jl-test');
        } else {
            res.locals.messages.push(["Successfully applied to test", "green"])
            return res.redirect('/user/profile');
        }
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

authRouter.get('/mytests', isauthenticated, (req, res) => {
    let dct = { title: "My Tests" };
    if (req.user.applied_tests) {
        dct['tests'] = req.user.applied_tests;
    } else dct['tests'] = [];
    return res.render('auth/mytests', dct);
});

authRouter.get('/editcv', isauthenticated, (req, res) => {
    let profile = req.user.profile ? req.user.profile : { details: {}, address: {}, education: { high: {}, intermediate: {}, graduation: {}, post_graduation: {} }, experience: [], skills: [] };

    let statelist = Profile.schema.path('address.state').enumValues;
    let dct = { title: "Edit Cv", user: req.user, profile: profile, statelist: statelist };
    console.log(dct);
    return res.render("auth/makecv", dct);
});

authRouter.post('/editcv', isauthenticated, (req, res, next) => {
    let data = req.body;
    userController.addprofile(req.user, data, (err, response) => {
        try {
            if (err) {
                messages = [];
                Object.keys(err.errors).forEach(error => {
                    messages.push([err.errors[error].message, "red"]);
                });
                return res.send({ success: true, messages: messages })
            } else {
                return res.send({
                    success: true,
                    messages: [
                        ["Profile updated successfully", "green"]
                    ]
                })
            }
        } catch (error) {
            console.error(error)
        }
    });

    //res.send({ success: true, data: req.body, message: "cv details" });
});


authRouter.get('/verify-email/:token', (req, res) => {
    let token = req.params.token;
    userController.verifytoken(token, "VERIFY", (err, response) => {
        if (err) {
            console.error(err)
            return res.redirect('/')
        }
        if (response) {
            res.locals.messages.push(["Your email has been verified successfully", "green"])
            return res.redirect('/')
        } else {
            res.locals.messages.push(["Invalid link or expired", "red"])
            return res.redirect('/')
        }
    })

});

authRouter.get('/resend-email', isauthenticated, (req, res, next) => {
    if (req.user.verified) {
        res.locals.messages.push(["Your email is verified", "green"]);
        return res.redirect('/user/profile')
    }
    userController.createtoken(req.user, "VERIFY", (err, token) => {
        res.locals.messages.push(["A verification link has been sent to your email. Please check your mail.", "green"])
        sendEmail(req.user.email, "Welcome", { link: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/user/verify-email/" + token.token }, "verification");
        return res.redirect('/')
    })
});

authRouter.post('/reset-password/:token', (req, res) => {
    let token = req.params.token;
    let data = req.body;
    if (data.password != data.confirm_password) {
        res.locals.messages.push(["Passwords don't match", "red"]);
        return res.render('login/resetpassword', { title: "Reset Password", token: token });
    }
    userController.verifytoken(token, "RESET_PASSWORD", (err, response) => {
        if (err) {
            console.error(err)
            return res.redirect('/')
        }
        if (response) {
            response.user.password = response.user.generateHash(data.password);
            response.user.save((err, data) => {
                res.locals.messages.push(["Password has been reset successfully", "green"]);
                return res.redirect('/login');
            });
        } else {
            res.locals.messages.push(["Invalid link or expired", "red"]);
            return res.redirect('/');
        }
    })

});

authRouter.get('/reset-password/:token', (req, res, next) => {
    userController.verifytoken(req.params.token, "RESET_PASSWORD", (err, response) => {
        if (err) {
            console.error(err);
            return res.redirect('/')
        }
        if (!response) {
            res.locals.messages.push(["Invalid link or expired", "red"]);
            return res.redirect('/');
        }

        let dct = { title: "Reset Password", token: req.params.token };
        return res.render('login/resetpassword', dct);

    });
});

authRouter.post('/forgot-password', (req, res, next) => {
    User.findOne({ "email": req.body.email }, (err, user) => {
        if (err) console.error(err);
        if (user) {
            res.locals.messages.push(["A password reset link has been sent to your email. Please check your mail.", "green"]);
            userController.createtoken(user, "RESET_PASSWORD", (err, token) => {
                sendEmail(req.body.email, "Welcome", { link: Config.REQ_PROTOCOL + "://" + Config.REQ_HOST + "/user/reset-password/" + token.token }, "passwordreset");
                res.redirect('/');
            });
        } else {
            res.locals.messages.push(["No user with the matching email found.", "red"]);
            res.redirect('/forgot-password');
        }
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