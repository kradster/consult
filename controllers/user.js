var User = require('../models/user');
var Token = require('../models/token');
var Test = require('../models/test');
var Profile = require('../models/profile');
var Experience = require('../models/experience');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId

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

module.exports.createtoken = function(user, callback){
    var newToken = new Token({
        user: user._id,
        token: crypto.randomBytes(16).toString('hex')
    })
    newToken.save(err => {
        if (err) return callback(err, null);
        else return callback(null, newToken);
    })
}

module.exports.verifytoken = function(token, callback){
    Token.findOne({"token": token}).populate('user').exec((err, token) => {
        console.log(token.user);
        if (err) return callback(err, null);
        else if (token.user){
            token.user.verified = true
            token.user.save(err => {
                if (err) return callback(err, null)
                else return callback(null, true);
            })
        }
        else return callback(null, false);
    })
}
module.exports.getUserProfile = function(user, callback) {
    Profile.findOne({ 'user': user._id }).populate({path: 'experience', populate: {path: 'experience'}}).exec((err, profile) => {
        return callback(null, profile);
    });
}

module.exports.addTest = function(user, id, data, callback) {
    Test.findOne({"_id": new ObjectId(id)}, (err, test) => {
        user.applied_tests.push({test: test._id, job: data.job})
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
                } else {
                    if (dat == "experience"){
                        data[dat].forEach(exp => {
                            let newExperience = new Experience({
                                type: exp.type,
                                profile: user.profile._id,
                                role: exp.role,
                                organization: exp.organization,
                                description: exp.description,
                                start_date: exp.start_date,
                                end_date: exp.end_date,
                            });
                            newExperience.save(err => {
                                if (err) return callback(err, null)
                                console.log('this is running save');
                                user.profile.experience.push(newExperience);
                                user.profile.save(err => {
                                    if (err) {console.log(err);}
                                })
                                console.log(user.profile)
                            })
                            delete this.newExperience;
                            console.log('newExperience', newExperience);
                        })
                    }else user.profile[dat] = data[dat];
                }
            })
            user.profile.save(err => {
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, user.profile)
                }
            })

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
};