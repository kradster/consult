const express = require('express');
var mainRouter = express.Router();
var sendEmail = require('../utils/email');
var adminController = require('../controllers/admin')
var userController = require('../controllers/user')
var testController = require('../controllers/test')
let subscriberController = require('../controllers/subscriber');

mainRouter.get('/', (req, res, next) => {
    let dct = { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company" }
    res.render("main/index", dct);
});

mainRouter.get('/signup', (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/user/profile');
    }
    next();
}, (req, res, next) => {
    let dct = { title: "JobLana Signup" };
    res.render('login/signup', dct);
});

mainRouter.get('/login', (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect('/user/profile');
        }
        next();
    },
    (req, res, next) => {
        let dct = { title: "JobLana Login" };
        res.render('login/login', dct);
    });

mainRouter.get('/upcoming-jl-test', (req, res, next) => {
    let dct = { title: "Upcoming JL Tests | Schedule your JL test Now" };
    testController.getTests((err, tests) => {
        if (err) {
            dct['tests'] = []
        } else {
            if (tests) dct['tests'] = tests;
            else dct['tests'] = []

        }
        return res.render('main/schedule', dct);
    });
});

mainRouter.get('/recruiters', (req, res, next) => {
    let dct = { title: "Post a job on Joblana for free | Get access to 10k+ qualified candidates" };
    res.render('main/recruiters', dct);
});

mainRouter.get('/about-joblana', (req, res, next) => {
    let dct = { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company" }
    res.render('main/about', dct);
});

mainRouter.get('/faq-joblana', (req, res, next) => {
    let dct = { title: "Frequently Asked Questions related to JobLana and JL assessment Test" };
    res.render('main/faq', dct);
});

mainRouter.get('/contact-joblana', (req, res) => {
    let dct = { title: "Contact JobLana | Reach out to us for JL assessment test, jobs and recruitment" };
    res.render('main/contact', dct);
});

mainRouter.get('/why-joblana-jl-test', (req, res) => {
    let dct = { title: "Why JobLana - All reason to choose JobLana for your better career" }
    res.render('main/whyjl', dct);
});

mainRouter.get('/joblana-recruiting-partners', (req, res) => {
    let dct = { title: "Our Partners | JobLana" }
    res.render('main/partners', dct);
});

mainRouter.get('/about-jl-test', (req, res) => {
    let dct = { title: "About JL Test - All you need to know about this innovative assessment test." }
    res.render('main/jltest', dct);
});

mainRouter.get('/how-it-works-joblana', (req, res) => {
    let dct = { title: "How it works? | Path to get job through JobLana platform" }
    res.render('main/how', dct);
});

mainRouter.get('/joblana-sample-paper-jl-test', (req, res) => {
    let dct = { title: "Sample Paper" }
    res.render('main/samplepaper', dct);
});

mainRouter.get('/post-a-job-joblana', (req, res) => {
    let dct = { title: "Post a job on Joblana for free | Get access to 10k+ qualified candidates" }
    res.render('main/recruiters', dct);
});

mainRouter.get('/freshers-job-listings', (req, res) => {
    let dct = { title: "Joblana" }
    res.render('main/joblist', dct);
});

mainRouter.get('/it-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about IT jobs -Roles & Responsibilities, latest IT jobs vacancy in india | JobLana" }
    res.render('main/itjob', dct);
});

mainRouter.get('/human-resources-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about HR jobs -Roles & Responsibilities, latest HR jobs vacancy in india | JobLana" }
    res.render('main/hrjob', dct);
});

mainRouter.get('/sales-and-marketing-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about Sales and Marketing jobs -Roles & Responsibilities, latest Sales and Marketing jobs vacancy in india | JobLana" }
    res.render('main/smjob', dct);
});

mainRouter.get('/accounting-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about Accounting jobs -Roles & Responsibilities, latest accounting jobs vacancy in india | JobLana" }
    res.render('main/accjob', dct);
});

mainRouter.get('/digital-marketing-jobs-for-freshers', (req, res) => {
    let dct = { title: "Document" };
    res.render('main/dmjob', dct);
});

mainRouter.get('/office-support-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about Office Sector jobs -Roles & Responsibilities, latest Office Sector jobs vacancy in india | JobLana" }
    res.render('main/osjob', dct);
});

mainRouter.get('/calling-jobs-for-freshers', (req, res) => {
    let dct = { title: "Call Jobs" };
    res.render('main/calljob', dct);
});

mainRouter.get('/operations-jobs-for-freshers', (req, res) => {
    let dct = { title: "All about Operation jobs -Roles & Responsibilities, latest Operation jobs vacancy in india | JobLana" }
    res.render('main/opjob', dct);
});

mainRouter.get('/privacy-policy', (req, res) => {
    let dct = { title: "Privacy Policy" }
    res.render('main/policy', dct);
});

mainRouter.get('/terms-and-conditions', (req, res) => {
    let dct = { title: "Privacy Policy" }
    res.render('main/terms', dct);
});

mainRouter.get('/forgot-password', (req, res) => {
    let dct = { title: "Forgot password" };
    res.render('login/forgotpassword', dct);
})

mainRouter.get('/job-opportunities', (req, res) => {
    let dct = { title: "Freshers job in India , Job opportunity in India , Job offers in India | JobLana" }
    adminController.getjobs((err, jobs) => {
        if (err) {
            dct['listings'] = []
        } else {
            if (jobs) dct['listings'] = jobs;
            else dct['listings'] = [];
        }
        return res.render('main/comlist', dct);
    });
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
                sendEmail(req.body.email, "Email Newsletter Subscribed", { link: req.headers.host }, "verification");
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

mainRouter.get('/company-info/:id', (req, res) => {
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
        return res.render('main/cominfo', dct);
    });

})


module.exports = mainRouter;