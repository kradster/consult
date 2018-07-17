const express = require('express');
var path = require('path');
template = path.join(__dirname, '../views/pages');
var mainRouter = express.Router();

mainRouter.get('/', (req, res, next) => {
    res.render("main/index", { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company", messages: [] });
});

mainRouter.get('/signup', (req, res, next) => {
    res.render('login/signup', { title: "JobLana Signup", messages: [] });
});

mainRouter.get('/login', (req, res, next) => {
    res.render('login/login', { title: "JobLana Login", messages: [] });
});

mainRouter.get('/upcoming-jl-test', (req, res, next) => {
    res.render('main/schedule', { title: "Upcoming JL Tests | Schedule your JL test Now", messages: [] });
});

mainRouter.get('/recruiters', (req, res, next) => {
    res.render('main/recruiters', { title: "Post a job on Joblana for free | Get access to 10k+ qualified candidates", messages: [] });
});

mainRouter.get('/jobs', (req, res, next) => {
    res.render('main/comlist', { title: "Freshers job in India , Job opportunity in India , Job offers in India | JobLana", messages: [] });
});

mainRouter.get('/about-joblana', (req, res, next) => {
    res.render('main/about', { title: "JobLana | India’s fastest assessment test for freshers job offering and recruitment company", messages: [] });
});

mainRouter.get('/faq-joblana', (req, res, next) => {
    res.render('main/faq', {
        title: "Frequently Asked Questions related to JobLana and JL assessment Test",
        messages: []
    });
});

mainRouter.get('/contact-joblana', (req, res) => {
    res.render('main/contact', { title: "Contact JobLana | Reach out to us for JL assessment test, jobs and recruitment", messages: [] });
});

mainRouter.get('/why-joblana-jl-test', (req, res) => {
    res.sendFile(path.join(template, '/whyjl.html'));
});

mainRouter.get('/joblana-recruiting-partners', (req, res) => {
    res.sendFile(path.join(template, '/partners.html'));
});

mainRouter.get('/about-jl-test', (req, res) => {
    res.sendFile('/templates/jltest.html', { root: __dirname });
});

mainRouter.get('/how-it-works-joblana', (req, res) => {
    res.sendFile('/templates/how.html', { root: __dirname });
});

mainRouter.get('/joblana-sample-paper-jl-test', (req, res) => {
    res.sendFile('/templates/samplepaper.html', { root: __dirname });
});

mainRouter.get('/post-a-job-joblana', (req, res) => {
    res.sendFile('/templates/recruiters.html', { root: __dirname });
});

mainRouter.get('/freshers-job-listings', (req, res) => {
    res.sendFile('/templates/joblist.html', { root: __dirname });
});

mainRouter.get('/it-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/itjob.html', { root: __dirname });
});

mainRouter.get('/human-resources-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/hrjob.html', { root: __dirname });
});

mainRouter.get('/sales-and-marketing-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/smjob.html', { root: __dirname });
});

mainRouter.get('/accounting-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/accjob.html', { root: __dirname });
});

mainRouter.get('/digital-marketing-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/dmjob.html', { root: __dirname });
});

mainRouter.get('/office-support-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/osjob.html', { root: __dirname });
});

mainRouter.get('/calling-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/.html', { root: __dirname });
});

mainRouter.get('/operations-jobs-for-freshers', (req, res) => {
    res.sendFile('/templates/opjob.html', { root: __dirname });
});

mainRouter.get('/privacy-policy', (req, res) => {
    res.sendFile('/templates/policy.html', { root: __dirname });
});

mainRouter.get('/terms-and-conditions', (req, res) => {
    res.sendFile('/templates/terms.html', { root: __dirname });
});

mainRouter.get('/job-opportunities', (req, res) => {
    res.sendFile('/templates/comlist.html', { root: __dirname });
});


mainRouter.post('/subscribe', (req, res) => {

    if (req.body.subscriptionemail)
        if (req.body.subscriptionemail != "") {
            db.exec("INSERT INTO JobAlerts(email) VALUES('" + req.body.subscriptionemail + "')", (err, row) => {
                if (err) console.log(err);
                return res.render('alert', { title: "Subscribed to Joblana Job Alerts!!", link: '/', linkname: 'Go back to home' });
            });
        }
});


mainRouter.get('/getjoblistings', (req, res) => {
    db.all("SELECT * FROM JobListings", (err, row) => {
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
    db.get("SELECT * FROM Users WHERE uniqueid = ?", req.body.uid, (err, row) => {
        if (!row) return res.send({ success: false, message: 'No User with the particular id found' });
        data = row;
        delete data.password;
        db.get("SELECT * FROM CV WHERE uniqueid = ?", req.body.uid, (err, row) => {
            if (!row) return res.send({ success: true, data: data });
            data["CV"] = row;
            res.send({ success: true, data: data });
        });
    });
});


module.exports = mainRouter;