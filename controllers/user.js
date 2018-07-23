var User = require('../models/user');
var Token = require('../models/token');
var Test = require('../models/test');
var Profile = require('../models/profile');
var Experience = require('../models/experience');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId
var async = require('async');
let crypto = require('crypto');

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

module.exports.createtoken = function(user, type, callback) {
    var newToken = new Token({
        user: user._id,
        token: crypto.randomBytes(16).toString('hex'),
        type: type
    })
    newToken.save(err => {
        if (err) return callback(err, null);
        else return callback(null, newToken);
    })
}

module.exports.verifytoken = function(token, type, callback) {
    Token.findOne({ "token": token }).populate('user').exec((err, token) => {
        if (err) return callback(err, null);
        if (!token) return callback(null, false);
        else if (token.user) {
            switch (type) {
                case "VERIFY":
                    token.user.verified = true;
                    token.user.save(err => {
                        if (err) return callback(err, null)
                        else return callback(null, true);
                    });
                    break;

                case "RESET_PASSWORD":
                    return callback(null, token);
                    break;
            }
        } else return callback(null, false);
    })
}
module.exports.getUserProfile = function(user, callback) {
    Profile.findOne({ 'user': user._id }).populate({ path: 'experience', populate: { path: 'experience' } }).exec((err, profile) => {
        return callback(null, profile);
    });
}

module.exports.addTest = function(user, id, data, callback) {
    Test.findOne({ "_id": new ObjectId(id) }, (err, test) => {
        user.applied_tests.push({ test: test._id, job: data.job })
        user.save(err => {
            console.log(err)
            return callback(err, test);
        })
    })
}
module.exports.addprofile = function(user, data, callback) {
    if (user.profile) {
        Object.keys(data).forEach(dat => {
            if (dat.includes('-')) {
                pri = dat.split('-')
                if (pri.length == 2) {
                    user.profile[pri[0]][pri[1]] = data[dat];
                } else if (pri.length == 3) {
                    user.profile[pri[0]][pri[1]][pri[2]] = data[dat];
                }
            } else if (dat == "experience") {
                let lst = [];
                data[dat].forEach(exp => {
                    lst.push(new Experience({
                        type: exp.type,
                        profile: user.profile._id,
                        role: exp.role,
                        organization: exp.organization,
                        description: exp.description,
                        start_date: exp.start_date,
                        end_date: exp.end_date
                    }));
                });

                function savelist(list) {
                    console.log('svaliet');
                    let tmp_exp = 0
                    list.forEach(exp => {
                        exp.save((err, ex) => {
                            if (err) console.log('error in savelist', err);
                            tmp_exp++;
                            console.log('list', list);
                            if (tmp_exp == list.length) {
                                console.log('saveing');
                                user.profile.experience = list;
                                user.profile.save(err => {
                                    if (err) console.log(err);
                                    console.log('tp');
                                });
                            };
                        });
                    })
                }
                savelist(lst);
                // console.log('lst', lst)
                // for( let i = 0; i < lst.length; i++){
                //     lst[i].save((err) => {
                //         if (err) console.log('error in exp saving', err);
                //         user.profile.experience.set(user.profile.experience.length + i, lst[i]);
                //         console.log('lst[i]', user.profile);
                //         if (i == lst.length-1)
                //         user.profile.save(err => {
                //             if (err) console.log("error", err);
                //             console.log('done', user.profile);
                //         });
                //     });
                // };
            } else user.profile[dat] = data[dat];
        });
        user.profile.save(err => {
            if (err) {
                console.log('eror in last save');
                return callback(err, null);
            } else {
                return callback(null, user.profile)
            }
        });
    } else {
        let newProfile = new Profile();
        newProfile.user = user._id;
        Object.keys(data).forEach(dat => {
            if (dat.includes('-')) {
                pri = dat.split('-')
                if (pri.length == 2) {
                    newProfile[pri[0]][pri[1]] = data[dat];
                } else if (pri.length == 3) {
                    newProfile[pri[0]][pri[1]][pri[2]] = data[dat];
                }
            } else {
                newProfile[dat] = data[dat];
            }
        })
        newProfile.save((err, profile) => {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    let error = new Error()
                    error.errors = { duplicate: { message: "Duplicated error" } }
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
}