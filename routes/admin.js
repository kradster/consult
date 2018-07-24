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
    if (req.user.role != "ADMIN") {
        req.session.messages.push(["You are not authorised to visit this page", "red"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

// Middlewares

adminRouter.get('/dashboard', isauthenticated, (req, res) => {
    let dct = { title: "Dashboard" }
    return res.render("admin/adminpanel", dct);
});

adminRouter.get('/addjob', isauthenticated, (req, res) => {
    let dct = { title: "Add Job" }
    return res.render("admin/jobadd", dct);
});

adminRouter.post('/addjob', isauthenticated, (req, res) => {
    let data = req.body;
    console.log("form data", data);
    adminController.addjob(req.user, data, (err, job) => {
        try {
            if (err) {
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addjob')
            } else {
                console.log(job);
                // sendEmail(req.user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Job Uploaded Successfully", "green"]);
                return res.redirect('/job-opportunities')
            }
        } catch (error) {
            console.error(error)
        }
    });
});

adminRouter.get('/addtest', isauthenticated, (req, res) => {
    let dct = { title: "Add test" }
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

adminRouter.get('/editjobs', isauthenticated, (req, res) => {
    adminController.getjobs((err, jobs) => {
        if (err) console.log(err);
        let dct = { title: "Edit jobs" };
        dct.jobs = jobs;
        res.render('admin/editjoblist', dct);
    });
});

adminRouter.get('/edit-info/:id', isauthenticated, (req, res) => {
    let dct = { title: "Company Info" };
    adminController.getjob(req.params.id, (err, job) => {
        if (err) {
            console.log(err)
            return res.redirect('/');
        } else if (job) {
            dct.job = job;
            console.log(dct.job);
        } else {
            dct.job = {};
            res.locals.messages.push(["No Job found", "red"]);
            return res.redirect('/');
        }
        return res.render('admin/editjobinfo', dct);
    });
});

adminRouter.post('/editjob/:id', isauthenticated, (req, res) => {
    console.log(req.body);
    adminController.editjob(req.params.id, req.body, (err, job) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        } else if (job) {
            res.redirect('/admin/editjobs');
        } else {
            res.locals.message.push(["Incorrect parameters", "red"]);
            return res.redirect('/');
        }
    });
});

module.exports = adminRouter;