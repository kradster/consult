var User = require('../models/user');
var Profile = require('../models/profile');

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
            if (err.name === 'MongoError' && err.code === 11000) {
                let error = new Error()
                error.errors = { duplicate: { message: "Email or mobile already registered" } }
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

module.exports.getUserProfile = function(user, callback) {
    Profile.findOne({ 'user': user._id }, (err, profile) => {
        return callback(null, profile);
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



module.exports.addprofile = function(user, data, callback) {
    if (user.profile) {
        Object.keys(data).forEach(dat => {
            if (dat.includes('_')){
                pri = dat.split('_')
                if (pri.length == 2){
                    user.profile[pri[0]][pri[1]] = data[dat];
                }
                else if (pri.length == 3){
                    user.profile[pri[0]][pri[1]][pri[2]] = data[dat];
                }
            }
            else{
                user.profile[dat] = data[dat];
            }
        })
        user.profile.save(err => {
            if(err){
                return callback(err, null);
            }
            else{
                return callback(null, user.profile)
            }
        })
        
    }
    else{
        let newProfile = new Profile();
            newProfile.user = user._id;
            newProfile.save((err, profile) => {
                if (err) {
                    if (err.name === 'MongoError' && err.code === 11000) {
                        let error = new Error()
                        error.errors = { duplicate: { message: "Email or mobile already registered" } }
                        return callback(error, null)
                    }
                    return callback(err, null)
                }
                user.profile = newProfile._id;
                user.save((err, profile) => {
                    if (err) {
                        if (err.name === 'MongoError' && err.code === 11000) {
                            let error = new Error()
                            error.errors = { duplicate: { message: "Email or mobile already registered" } }
                            return callback(error, null)
                        }
                        return callback(err, null)
                    }
                });
                return callback(null, newProfile);
            });
    }
        // data["projects"] = data.projecttype.map((x, i) => {
    //     return data.projecttype[i] + ", " + data.projectrole[i] + ", " + data.projectinstitute[i] + ", " + data.projectdetails[i] + ", " + data.projectstartdate[i] + " to " + data.projectenddate[i];
    // }).join(";\n");
    // delete data.projecttype;
    // delete data.projectrole;
    // delete data.projectinstitute;
    // delete data.projectdetails;
    // delete data.projectstartdate;
    // delete data.projectenddate;
    // data.skills = data.skills.join(", ");
    // data["email"] = email;
    // let keys = Object.keys(data);
    // let vals = Object.values(data).map(x => { if (typeof(x) == "string") return x.replace("'", "''") });
    // sql = [];
    // for (let i = 0; i < keys.length; i++)
    //     sql.push(keys[i] + " = '" + vals[i] + "'");
    // sql = "UPDATE CV SET " + sql.join(", ") + " WHERE uniqueid = '" + user_id + "'";
    // console.log(sql);
    // //sql = "INSERT INTO CV(" + Object.keys(data).join(",") + ") VALUES('" + vals.join("', '") + "');";
    // db.exec(sql, (err, response) => {
    //     if (err) {
    //         return callback(err, null);
    //     }
    //     return callback(null, { success: true, message: "CV updated Successfully" })
    // });
    // aaaaa_bbbbbbb_ccccccc
}