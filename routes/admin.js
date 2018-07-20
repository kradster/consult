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
    adminController.addjob(user, data, (err, job) => {
        try {
            if (err) {
                console.log('errror')
                console.error(err);
                messages = [];
                Object.keys(err.errors).forEach(error => {
                    console.log(err.errors[error].message);
                    messages.push([err.errors[error].message, "red"]);
                });
                return res.send({success: true, messages: messages})
            } else {
                return res.send({success: true, messages: [["Job added successfully", "green"]]})
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

adminRouter.get('/admin/download', isauthenticated, (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.download(process.cwd() + '/database.db');
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
})


adminRouter.get('/adminpanel', isauthenticated, (req, res) => {
    if (req.session.user === "") {
        res.sendFile('/templates/adminpanel.html', { root: __dirname });
    } else
        res.redirect('/login');
});

adminRouter.post('/adminpanel', isauthenticated, (req, res) => {
    if (req.session.user === "") {
        db.all('SELECT * FROM JobListings', (err, row) => {
            res.send({ success: true, data: row });

        });
    } else
        res.send({ success: false, message: "Incorrect login" });
});

module.exports = adminRouter;