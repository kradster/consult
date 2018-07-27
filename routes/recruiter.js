'use strict';
const express = require('express');
var recruiterRouter = express.Router();
var recruiterController = require('../controllers/recruiter')
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
    if (req.user.role != "RECRUITER") {
        req.session.messages.push(["You are not authorised to visit this page", "red"])
        req.session.next = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}
// Middlewares

recruiterRouter.get('/dashboard', isauthenticated, (req, res) => {
    let dct = { title: "Dashboard" }
    return res.render("recruiter/adminpanel", dct);
});

recruiterRouter.get('/addjob', isauthenticated, (req, res) => {
    let dct = { title: "Add Job" }
    return res.render("recruiter/jobadd", dct);
});

recruiterRouter.post('/addjob', isauthenticated, (req, res) => {
    let data = req.body;
    recruiterController.addjob(req.user, data, (err, job) => {
        try {
            if (err) {
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/recruiter/addjob')
            } else {
                // sendEmail(req.user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Job Uploaded Successfully", "green"]);
                return res.redirect('/recruiter/editjob')
            }
        } catch (error) {
            console.error(error)
        }
    });
});

recruiterRouter.get('/editjobs', isauthenticated, (req, res) => {
    recruiterController.getjobs(req.user, (err, jobs) => {
        if (err) console.error(err);
        let dct = { title: "Edit jobs" };
        dct.jobs = jobs;
        res.render('recruiter/editjoblist', dct);
    });
});

recruiterRouter.get('/edit-info/:id', isauthenticated, (req, res) => {
    let dct = { title: "Company Info" };
    recruiterController.getjob(req.user, req.params.id, (err, job) => {
        if (err) {
            console.error(err)
            return res.redirect('/');
        } else if (job) {
            dct.job = job;
        } else {
            dct.job = {};
            res.locals.messages.push(["No Job found", "red"]);
            return res.redirect('/');
        }
        return res.render('recruiter/editjobinfo', dct);
    });
});

recruiterRouter.post('/edit-info/:id', isauthenticated, (req, res) => {
    let id = req.params.id;
    let data = req.body;
    Object.keys(data).forEach(key => {
        if (data[key] == '') {
            delete data[key];
        }
    });
    recruiterController.editjob(req.user, id, data, (err, job) => {
        if (err) {
            Object.values(err.errors).forEach(error => {
                res.locals.messages.push([error.message, "red"]);
            });
            return res.redirect('/recruiter/edit-info/' + id)
        } else if (job) {
            res.locals.messages.push(["Job updated Successfully", "green"]);
            res.redirect('/company-info/' + id);
        } else {
            res.locals.message.push(["Incorrect parameters", "red"]);
            return res.redirect('/');
        }
    });
});


module.exports = recruiterRouter;