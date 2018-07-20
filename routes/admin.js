const express = require('express');
var adminRouter = express.Router();
var adminController = require('../controllers/admin')
var testController = require('../controllers/test')
var passport = require('passport');
var sendEmail = require('../utils/email');

// Middlewares
function isauthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.messages.push(["Please login to access this page", "blue"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    if (req.user.role != "ADMIN"){
        req.session.messages.push(["You are not authorised to visit this page", "red"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

// Middlewares

adminRouter.get('/dashboard', isauthenticated, (req, res) => {
    let dct = {title: "Dashboard"}
    return res.render("admin/adminpanel", dct);
});

adminRouter.get('/addjob', isauthenticated, (req, res) => {
    let dct = {title: "Add Job"}
    return res.render("admin/jobadd", dct);
});

adminRouter.post('/addjob', isauthenticated, (req, res) => {
    let data = req.body;
    console.log(data);
    adminController.addjob(req.user, data, (err, job) => {
        try {
            if (err) {
                console.log('errror')
                console.error(err);
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addjob')
            } else {
                console.log(job);
                // sendEmail(req.user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Successful signup", "green"]);
                return res.redirect('/job-opportunities')
            }
        } catch (error) {
            console.error(error)
        }
    });
});

adminRouter.get('/addtest', isauthenticated, (req, res) => {
    let dct = {title: "Add test"}
    return res.render("admin/testadd", dct);
});

adminRouter.post('/addtest', isauthenticated, (req, res) => {
    let data = req.body;
    let tmp = data.jobs.split('|');
    tmp = tmp.map(t => t.trim().toUpperCase());
    data.jobs = tmp;
    console.log(data);
    testController.createTest(req.user, data, (err, test) => {
        try {
            if (err) {
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addjob')
            } else {
                console.log(test);
                // sendEmail(req.user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Test uploaded", "green"]);
                return res.redirect('/upcoming-jl-test')
            }
        } catch (error) {
            console.error(error)
        }
    });
});


adminRouter.get('/admin/editjobs', isauthenticated, (req, res) => {

});

module.exports = adminRouter;