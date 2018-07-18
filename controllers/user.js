const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.db', err => {
    if (err) return console.error(err.message);
});

module.exports.subscribe_email = function(email, callback){
	db.exec("INSERT INTO JobAlerts(email) VALUES('" + email + "')", (err, row) => {
        if (err) {
        	console.log(err);
        	return
        }
        if (callback){
        	callback(null, row);
        }
                
    });
}

module.exports.getjoblistings = function(callback){
    db.all("SELECT * FROM JobListings", (err, row) => {
        if (err) {
            console.log(err);
            return
        }
        if (callback){
            callback(null, row);
        }
                
    });
}

module.exports.userdata = function(uid, callback){
    db.get("SELECT * FROM Users WHERE uniqueid = ?", uid, (err, row) => {
        let dct = {};
        if (!row) {
            callback(null, { success: false, message: 'No User with the particular id found' });
            return;
        }
        data = row;
        dct.firstname = data.firstname;
        dct.lastname = data.lastname;
        dct.email = data.email;
        dct.phoneno = data.phoneno;
        dct.verified = data.verified;
        db.get("SELECT * FROM CV WHERE uniqueid = ?", uid, (err, row) => {
            if (!row) {
                callback(null, { success: true, data: dct });
                return;
            }
            dct["CV"] = row;
            console.log('user_data')
            console.log({ success: true, data: dct });
            callback(null, { success: true, data: dct });
        });
    });
}

module.exports.userlogin = function(email, password, callback){
    db.get("SELECT * FROM Users WHERE email = ?", email, (err, userrow) => {
        if (err) {
            return callback(err, null)
        }
        if (!userrow) {
            return callback(null, {success: false, message: "Email id not found"})
        }
        else {
            return callback(null, {success: true, user: userrow})
        }
    });
}