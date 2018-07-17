const express = require('express');
var path = require('path');
template = path.join(__dirname, '../views/pages');
var mainRouter = express.Router();


mainRouter.get('/signup', (req, res) => {
    res.render('login/signup', {title: "JobLana Signup"});
});

mainRouter.get('/login', (req, res) => {
    res.render('login/login', {title: "JobLana Login"});
});

mainRouter.get('/upcoming-jl-test', (req, res) => {
    res.render(path.join(template, '/schedule'));
});

mainRouter.get('/recruiters', (req, res) => {
    res.sendFile(path.join(template, '/recruiters.html'));
});

mainRouter.get('/jobs', (req, res) => {
    res.sendFile(path.join(template, '/comlist.html'));
});

mainRouter.get('/about-joblana', (req, res) => {
    res.sendFile(path.join(template, '/about.html'));
});

mainRouter.get('/faq-joblana', (req, res) => {
    res.sendFile(path.join(template, '/faq.html'));
});

mainRouter.get('/contact-joblana', (req, res) => {
    res.sendFile(path.join(template, '/contact.html'));
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



module.exports = mainRouter;