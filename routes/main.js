const express = require('express');
var mainRouter = express.Router();
var sendEmail = require('../utils/email');

var userController = require('../controllers/user')
let subscriberController = require('../controllers/subscriber');

mainRouter.get('/', (req, res, next) => {
    dct = { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company" }
    res.render("main/index", dct);
});

mainRouter.get('/signup', (req, res, next) => {
    dct = { title: "JobLana Signup" };
    res.render('login/signup', dct);
});

mainRouter.get('/login', (req, res, next) => {
    dct = { title: "JobLana Login" };
    res.render('login/login', dct);
});

mainRouter.get('/upcoming-jl-test', (req, res, next) => {
    dct = { title: "Upcoming JL Tests | Schedule your JL test Now" };
    res.render('main/schedule', dct);
});

mainRouter.get('/recruiters', (req, res, next) => {
    dct = { title: "Post a job on Joblana for free | Get access to 10k+ qualified candidates" };
    res.render('main/recruiters', dct);
});

mainRouter.get('/jobs', (req, res, next) => {
    dct = { title: "Freshers job in India , Job opportunity in India , Job offers in India | JobLana" };
    res.render('main/comlist', dct);
});

mainRouter.get('/about-joblana', (req, res, next) => {
    dct = { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company" }
    res.render('main/about', dct);
});

mainRouter.get('/faq-joblana', (req, res, next) => {
    dct = { title: "Frequently Asked Questions related to JobLana and JL assessment Test" };
    res.render('main/faq', dct);
});

mainRouter.get('/contact-joblana', (req, res) => {
    res.render('main/contact', { title: "Contact JobLana | Reach out to us for JL assessment test, jobs and recruitment" });
});

mainRouter.get('/why-joblana-jl-test', (req, res) => {
    res.render('main/whyjl', { title: "Why JobLana - All reason to choose JobLana for your better career" });
});

mainRouter.get('/joblana-recruiting-partners', (req, res) => {
    res.render('main/partners', { title: "Our Partners | JobLana" });
});

mainRouter.get('/about-jl-test', (req, res) => {
    res.render('main/jltest', { title: "About JL Test - All you need to know about this innovative assessment test." });
});

mainRouter.get('/how-it-works-joblana', (req, res) => {
    res.render('main/how', { title: "How it works? | Path to get job through JobLana platform" });
});

mainRouter.get('/joblana-sample-paper-jl-test', (req, res) => {
    res.render('main/samplepaper', { title: "Sample Paper" });
});

mainRouter.get('/post-a-job-joblana', (req, res) => {
    res.render('main/recruiters', { title: "Post a job on Joblana for free | Get access to 10k+ qualified candidates" });
});

mainRouter.get('/freshers-job-listings', (req, res) => {
    res.render('main/joblist', { title: "Joblana" });
});

mainRouter.get('/it-jobs-for-freshers', (req, res) => {
    res.render('main/itjob', { title: "All about IT jobs -Roles & Responsibilities, latest IT jobs vacancy in india | JobLana" });
});

mainRouter.get('/human-resources-jobs-for-freshers', (req, res) => {
    res.render('main/hrjob', { title: "All about HR jobs -Roles & Responsibilities, latest HR jobs vacancy in india | JobLana" });
});

mainRouter.get('/sales-and-marketing-jobs-for-freshers', (req, res) => {
    res.render('main/smjob', { title: "All about Sales and Marketing jobs -Roles & Responsibilities, latest Sales and Marketing jobs vacancy in india | JobLana" });
});

mainRouter.get('/accounting-jobs-for-freshers', (req, res) => {
    res.render('main/accjob', { title: "All about Accounting jobs -Roles & Responsibilities, latest accounting jobs vacancy in india | JobLana" });
});

mainRouter.get('/digital-marketing-jobs-for-freshers', (req, res) => {
    res.render('main/dmjob', { title: "Document" });
});

mainRouter.get('/office-support-jobs-for-freshers', (req, res) => {
    res.render('main/osjob', { title: "All about Office Sector jobs -Roles & Responsibilities, latest Office Sector jobs vacancy in india | JobLana" });
});

mainRouter.get('/calling-jobs-for-freshers', (req, res) => {
    res.render('main/calljob', { title: "Call Jobs", messages: [] });
});

mainRouter.get('/operations-jobs-for-freshers', (req, res) => {
    res.render('main/opjob', { title: "All about Operation jobs -Roles & Responsibilities, latest Operation jobs vacancy in india | JobLana", messages: [] });
});

mainRouter.get('/privacy-policy', (req, res) => {
    res.render('main/policy', { title: "Privacy Policy", messages: [] });
});

mainRouter.get('/terms-and-conditions', (req, res) => {
    res.render('main/terms', { title: "Privacy Policy", messages: [] });
});

mainRouter.get('/job-opportunities', (req, res) => {
    res.render('main/comlist', { title: "Freshers job in India , Job opportunity in India , Job offers in India | JobLana", messages: [] });
});


mainRouter.post('/subscribe', (req, res) => {
    if (req.body.email) {
        if (req.body.email != "") {
            subscriberController.subscribe_email(req.body.email, req.body.name, (err, data) => {
                if (err) {
                    res.send({
                        success: false,
                        messages: [
                            [err.message, "red"]
                        ]
                    });
                    return
                }
                sendEmail(req.body.email, "Email Newsletter Subscribed", { link: "https://www.joblana.com" }, "verification");
                res.send({
                    success: true,
                    messages: [
                        ["Subscribed to Joblana Job Alerts!!", "green"]
                    ]
                });
            });

        }
    }
});

mainRouter.get('/getjoblistings', (req, res) => {
    userController.getjoblistings((err, row) => {
        if (!row) {
            console.log("No rows found");
            return res.send({ success: false, message: "0 job listings" });
        }
        console.log("Fetching job listings...", row.length, "rows found");
        return res.send({ success: true, data: row });
    });
});

mainRouter.post('/getuserdata', (req, res) => {
    if (!req.body.uid) return res.send({ success: false, message: "Userid uid required" });
    userController.userdata(req.body.uid, (err, row) => {
        if (row.success == true) {
            return res.send({ success: true, data: dct });
        } else {
            return res.send({
                success: false,
                messages: [
                    [row.message, "red"]
                ]
            });
        }
    })

});


module.exports = mainRouter;