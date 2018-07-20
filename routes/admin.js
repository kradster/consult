const express = require('express');
var adminRouter = express.Router();
var userController = require('../controllers/user')
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
    return res.render("auth/adminpanel", dct);
});

adminRouter.get('/admin/jobadd', isauthenticated, (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.sendFile('/admin/jobadd.html', { root: __dirname });
    } else
        res.redirect('/');

});

adminRouter.post('/addjob', isauthenticated, (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        data = req.body;
        data["listingid"] = Date.now() + "";
        data["approved"] = "no";
        let vals = Object.values(data).map(x => x.replace("'", "''"));
        sql = "INSERT INTO JobListings(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";

        console.log(sql);
        //console.log(req.body);
        db.exec(sql, err => {
            if (err) return res.render('alert', { title: err + "", link: "/", linkname: "Goto home" });
            console.log('Job Listing added');
            return res.render('alert', { title: "Job Listing added", link: "/jobs", linkname: "Goto Jobs" });
        });
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
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