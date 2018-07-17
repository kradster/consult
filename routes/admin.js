const express = require('express');
var path = require('path');
template = path.join(__dirname, '../static/templates');
var adminRouter = express.Router();


adminRouter.post('/adminlogin', (req, res) => {
    if (req.body.password === Config.ADMIN_KEY) {
        req.session.admin = "admin" + Config.ADMIN_KEY;
        res.redirect('/admin');
    } else
        res.render('alert', { title: "Incorrect login attempt", link: "/", linkname: "Go back to home" });
});

adminRouter.get('/admin', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.sendFile('/admin/adminpanel.html', { root: __dirname });
    } else
        res.render('alert', { title: "Incorrect login attempt", link: "/", linkname: "Go back to home" });
});

adminRouter.get('/admin/jobadd', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.sendFile('/admin/jobadd.html', { root: __dirname });
    } else
        res.redirect('/');

});

adminRouter.post('/addjob', (req, res) => {
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

adminRouter.get('/admin/editjobs', (req, res) => {
    db.all("SELECT * FROM JobListings", (err, rows) => {
        console.log("Fetched ", rows.length, "rows");
        rows = rows.slice(0, 3);
        res.render('comlist', { data: rows });
    });

});

adminRouter.get('/admin/download', (req, res) => {
    if (req.session.admin === ("admin" + Config.ADMIN_KEY)) {
        res.download(process.cwd() + '/database.db');
    } else
        res.render('alert', { title: "Incorrect login activity", link: "/", linkname: "Go to Home" });
})


adminRouter.get('/adminpanel', (req, res) => {
    if (req.session.user === "") {
        res.sendFile('/templates/adminpanel.html', { root: __dirname });
    } else
        res.redirect('/login');
});

adminRouter.post('/adminpanel', (req, res) => {
    if (req.session.user === "") {
        db.all('SELECT * FROM JobListings', (err, row) => {
            res.send({ success: true, data: row });

        });
    } else
        res.send({ success: false, message: "Incorrect login" });
});

module.exports = adminRouter;