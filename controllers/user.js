const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.db', err => {
    if (err) return console.error(err.message);
});

let bcrypt = require('bcrypt-nodejs');


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
        else if (!bcrypt.compareSync(password, userrow.password)){
            return callback(null, {success: false, message: "Incorrect password"})
        }
        else {
            return callback(null, {success: true, user: userrow})
        }
    });
}

module.exports.createuser = function(user, callback){
    db.get("SELECT * FROM Users WHERE email = ?", user.email, (err, row) => {
        if (row) return callback(null, { success: false, message: "The account associated with the email already exists" });
        delete user.cpassword;
        user["uniqueid"] = Date.now();
        user["verified"] = "no";
        user.password = bcrypt.hashSync(user.password);
        sql = "INSERT INTO Users(" + Object.keys(user).join(",") + ") VALUES('" + Object.values(user).join("', '") + "');";
        db.exec(sql, (err) => {
            if (err) return callback(err, null);
            console.log("Account created");
            db.exec("INSERT INTO CV(uniqueid) VALUES('" + user.uniqueid + "')", (err, row) => {
                if (err) return callback(err, null);
                return callback(null, { success: true, message: "Your Account has been created" });
            });
        });
    });
}