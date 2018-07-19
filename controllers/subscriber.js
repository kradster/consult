var Subsriber = require('../models/subsriber');


module.exports.subscribe_email = function(email, callback) {
    db.exec("INSERT INTO JobAlerts(email) VALUES('" + email + "')", (err, row) => {
        if (err) {
            console.log(err);
            return
        }
        if (callback) {
            callback(null, row);
        }

    });
}
