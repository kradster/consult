'use strict';
const express = require('express');
var adminRouter = express.Router();
var adminController = require('../controllers/admin')
var passport = require('passport');
var sendEmail = require('../utils/email');
let User = require('../models/user');

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
    adminController.addjob(req.user, data, (err, job) => {
        try {
            if (err) {
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addjob')
            } else {
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
    let tmp = data.jobs;
    console.log(data);
    if (!tmp || data.title == "" || data.date == "" || data.location == "") {
        res.locals.messages.push(["You need to fill in all fields", "red"]);
        return res.redirect('/admin/addtest');
    }
    tmp = tmp.map(t => t.trim().toUpperCase());
    data.jobs = tmp;
    adminController.createTest(req.user, data, (err, test) => {
        try {
            if (err) {
                Object.values(err.errors).forEach(error => {
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addtest');
            } else {
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
        if (err) console.error(err);
        let dct = { title: "Edit jobs" };
        dct.jobs = jobs;
        res.render('admin/editjoblist', dct);
    });
});

adminRouter.get('/edit-info/:id', isauthenticated, (req, res) => {
    let dct = { title: "Company Info" };
    adminController.getjob(req.params.id, (err, job) => {
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
        return res.render('admin/editjobinfo', dct);
    });
});

adminRouter.post('/edit-info/:id', isauthenticated, (req, res) => {
    let id = req.params.id;
    let data = req.body;
    console.log(data);
    Object.keys(data).forEach(key => {
        if (data[key] == '') {
            delete data[key];
        }
    });
    if (!data.approved)
        data.approved = false;
    adminController.editjob(id, data, (err, job) => {
        if (err) {
            Object.values(err.errors).forEach(error => {
                res.locals.messages.push([error.message, "red"]);
            });
            return res.redirect('/admin/edit-info/' + id)
        } else if (job) {
            res.locals.messages.push(["Job updated Successfully", "green"]);
            res.redirect('/company-info/' + id);
        } else {
            res.locals.message.push(["Incorrect parameters", "red"]);
            return res.redirect('/');
        }
    });
});

adminRouter.get('/viewusers', isauthenticated, (req, res) => {
    let rolelist = User.schema.path('role').enumValues;
    let dct = { title: "Users", users: [], rolelist: rolelist };
    adminController.getusers((err, users) => {
        if (err) console.error(err);
        for (let i = 0; i < users.length; i++) {
            dct.users.push({
                name: users[i].name,
                verified: users[i].verified,
                role: users[i].role,
                email: users[i].email,
                phoneno: users[i].phoneno,
                applied_tests: users[i].applied_tests,
                profile: users[i].profile ? users[i].profile : { details: {}, address: {}, education: { high: {}, intermediate: {}, graduation: {}, post_graduation: {} }, experience: [], skills: [] }
            });
        }
        res.render('admin/viewusers', dct);
    });

});

adminRouter.get('/view-booked-tests', isauthenticated, (req, res) => {
    let rolelist = User.schema.path('role').enumValues;
    let dct = { title: "Booked Tests", tests: [] };
    adminController.getBookTests((err, tests) => {
        if (err) {
            console.error(err);
            res.locals.message.push(["Some error occurec", "red"]);
            return res.redirect('/admin/dashboard')
        }
        for (let i = 0; i < tests.length; i++) {
            dct.tests.push({
                user: tests[i].user._id,
                title: tests[i].test.title,
                status: tests[i].status,
                payment_done: tests[i].payment_done,
                email: tests[i].user.email,
                job: tests[i].job,
            });
        }
        res.render('admin/bookedtests', dct);
    });

});

adminRouter.get('/usercsv', isauthenticated, function(req, res, next) {
    var filename   = "users.csv";
    var dataArray;
    User.find().exec({}, (err, users) => {
        if (err) {
            console.error(err);
            return res.send(err);
        }
        let csv_users = [];
        users.forEach(user=> {
            csv_users.push({name: user.fullname, email: user.email});
        })
        console.log(csv_users);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader("Content-Disposition", 'attachment; filename='+filename);
        res.csv(csv_users, true);
    });
});


module.exports = adminRouter;