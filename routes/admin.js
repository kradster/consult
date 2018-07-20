const express = require('express');
var adminRouter = express.Router();
var adminController = require('../controllers/admin')
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
    return res.render("admin/adminpanel", dct);
});

adminRouter.get('/addjob', isauthenticated, (req, res) => {
    return res.render("admin/jobadd", dct);
});

adminRouter.post('/addjob', isauthenticated, (req, res) => {
    data = req.body;
    console.log(data);
    adminController.addjob(req.user, data, (err, job) => {
        try {
            if (err) {
                console.log('errror')
                console.error(err);
                Object.values(err.errors).forEach(error => {
                    console.log(error.message);
                    res.locals.messages.push([error.message, "red"]);
                });
                return res.redirect('/admin/addjob')
            } else {
                console.log(user);
                sendEmail(user.email, "Welcome", { link: "https://www.joblana.com" }, "verification");
                res.locals.messages.push(["Successful signup", "green"]);
                return res.redirect('/job-opportunities')
            }
        } catch (error) {
            console.error(error)
        }
    });
});

adminRouter.get('/admin/editjobs', isauthenticated, (req, res) => {
    db.all("SELECT * FROM JobListings", (err, rows) => {
        console.log("Fetched ", rows.length, "rows");
        rows = rows.slice(0, 3);
        res.render('comlist', { data: rows });
    });

});

module.exports = adminRouter;