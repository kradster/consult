var mongoose = require('mongoose');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.db', err => {
    if (err) return console.error(err.message);
});

let bcrypt = require('bcrypt-nodejs');


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

module.exports.getjoblistings = function(callback) {
    db.all("SELECT * FROM JobListings", (err, row) => {
        if (err) {
            console.log(err);
            return
        }
        if (callback) {
            callback(null, row);
        }

    });
}

module.exports.userdata = function(uid, callback) {
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

module.exports.userlogin = function(email, password, callback) {
    db.get("SELECT * FROM Users WHERE email = ?", email, (err, userrow) => {
        if (err) {
            return callback(err, null)
        }
        if (!userrow) {
            return callback(null, { success: false, message: "Email id not found" })
        } else if (!bcrypt.compareSync(password, userrow.password)) {
            return callback(null, { success: false, message: "Incorrect password" })
        } else {
            return callback(null, { success: true, user: userrow })
        }
    });
}

module.exports.createuser = function(user, callback) {

    let userschema = require('./models/user.js');
    let userdat = new userschema({
        email: data.email,
        name: {
            first: data.firstname,
            second: data.lastname
        },
        password: bcrypt.hashSync(data.password),
        phoneno: data.phoneno
    });
    userdat.validate()
    userdat.save((err, userdat) => {
        if (err) return console.error(err);

    });
    // db.get("SELECT * FROM Users WHERE email = ?", user.email, (err, row) => {
    //     if (row) return callback(null, { success: false, message: "The account associated with the email already exists" });
    //     delete user.cpassword;
    //     user["uniqueid"] = Date.now();
    //     user["verified"] = "no";
    //     user.password = bcrypt.hashSync(user.password);
    //     sql = "INSERT INTO Users(" + Object.keys(user).join(",") + ") VALUES('" + Object.values(user).join("', '") + "');";
    //     db.exec(sql, (err) => {
    //         if (err) return callback(err, null);
    //         console.log("Account created");
    //         db.exec("INSERT INTO CV(uniqueid) VALUES('" + user.uniqueid + "')", (err, row) => {
    //             if (err) return callback(err, null);
    //             return callback(null, { success: true, message: "Your Account has been created" });
    //         });
    //     });
    // });
}

module.exports.addcvdata = function(data, user_id, email, callback) {
    console.log('addvsdata');
    console.log(data, user_id, email);
    data["projects"] = data.projecttype.map((x, i) => {
        return data.projecttype[i] + ", " + data.projectrole[i] + ", " + data.projectinstitute[i] + ", " + data.projectdetails[i] + ", " + data.projectstartdate[i] + " to " + data.projectenddate[i];
    }).join(";\n");
    delete data.projecttype;
    delete data.projectrole;
    delete data.projectinstitute;
    delete data.projectdetails;
    delete data.projectstartdate;
    delete data.projectenddate;
    data.skills = data.skills.join(", ");
    data["email"] = email;
    let keys = Object.keys(data);
    let vals = Object.values(data).map(x => { if (typeof(x) == "string") return x.replace("'", "''") });
    sql = [];
    for (let i = 0; i < keys.length; i++)
        sql.push(keys[i] + " = '" + vals[i] + "'");
    sql = "UPDATE CV SET " + sql.join(", ") + " WHERE uniqueid = '" + user_id + "'";
    console.log(sql);
    //sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";
    db.exec(sql, (err, response) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, { success: true, message: "CV updated Successfully" })
    });
}