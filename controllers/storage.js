const os = require('os');
const storage = require('../utils/storage');
const fs = require('fs');

module.exports.upload_file = function(req, res, next) {
    if (!req.files) return res.status(400).send('No files were uploaded.');
    let sampleFile = req.files.sampleFile;
    if (req.files.sampleFile.name.split('.')[1] != "pdf") {
        res.locals.messages.push(["Extension Not allowed", "red"]);
        return res.redirect("/user/profile");
    }
    let filepath = os.homedir() + '/.tmp/' + req.user.id + ".pdf";
    sampleFile.mv(filepath, function(err) {
        if (err) {
            console.error(err);
            res.locals.messages.push(["Could not find the file", "red"]);
            return res.redirect("/user/profile");
        }
    	storage.upload_file("resume_" + req.user.id + ".pdf", filepath, "resumes", (err, result) => {
            if (err) {
                console.error(err);
                res.locals.messages.push(["Could not upload the file", "red"]);
                return res.redirect("/user/profile");
            }
            res.locals.messages.push(["Resume uploaded successfully", "green"]);
            fs.stat(filepath, (err, stats) => {
                if (err) {
                    console.error(err);
                    return res.redirect("/user/profile");
                }
            });
            fs.unlink(filepath, (err) => {
                if (err) console.error(err);
                return res.redirect("/user/profile");
            });
        });
    });
}