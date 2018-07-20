var User = require('../models/user');

module.exports.createuser = function(user, callback) {
    let userdat = new User({
        email: user.email,
        name: {
            first: user.firstname,
            last: user.lastname
        },
        phoneno: user.phoneno
    });
    userdat.password = userdat.generateHash(user.password)
    userdat.save((err, userdat) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000){
                let error = new Error()
                error.errors = {duplicate: {message: "Email or mobile already registered"}}
                return callback(error, null)
            }
            return callback(err, null)
        }
        return callback(null, userdat);
    });
}


// module.exports.getjoblistings = function(callback) {
//     db.all("SELECT * FROM JobListings", (err, row) => {
//         if (err) {
//             console.log(err);
//             return
//         }
//         if (callback) {
//             callback(null, row);
//         }

//     });
// }

module.exports.getUserProfile = function(uid, callback) {
    db.get("SELECT * FROM Users WHERE uniqueid = ?", uid, (err, row) => {
        let dct = {};
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

// module.exports.userlogin = function(email, password, callback) {
//     db.get("SELECT * FROM Users WHERE email = ?", email, (err, userrow) => {
//         if (err) {
//             return callback(err, null)
//         }
//         if (!userrow) {
//             return callback(null, { success: false, message: "Email id not found" })
//         } else if (!bcrypt.compareSync(password, userrow.password)) {
//             return callback(null, { success: false, message: "Incorrect password" })
//         } else {
//             return callback(null, { success: true, user: userrow })
//         }
//     });
// }



// module.exports.addcvdata = function(data, user_id, email, callback) {
//     console.log('addvsdata');
//     console.log(data, user_id, email);
//     data["projects"] = data.projecttype.map((x, i) => {
//         return data.projecttype[i] + ", " + data.projectrole[i] + ", " + data.projectinstitute[i] + ", " + data.projectdetails[i] + ", " + data.projectstartdate[i] + " to " + data.projectenddate[i];
//     }).join(";\n");
//     delete data.projecttype;
//     delete data.projectrole;
//     delete data.projectinstitute;
//     delete data.projectdetails;
//     delete data.projectstartdate;
//     delete data.projectenddate;
//     data.skills = data.skills.join(", ");
//     data["email"] = email;
//     let keys = Object.keys(data);
//     let vals = Object.values(data).map(x => { if (typeof(x) == "string") return x.replace("'", "''") });
//     sql = [];
//     for (let i = 0; i < keys.length; i++)
//         sql.push(keys[i] + " = '" + vals[i] + "'");
//     sql = "UPDATE CV SET " + sql.join(", ") + " WHERE uniqueid = '" + user_id + "'";
//     console.log(sql);
//     //sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";
//     db.exec(sql, (err, response) => {
//         if (err) {
//             return callback(err, null);
//         }
//         return callback(null, { success: true, message: "CV updated Successfully" })
//     });
// }