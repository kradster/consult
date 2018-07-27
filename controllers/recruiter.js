var User = require('../models/user');
var Job = require('../models/job');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId

module.exports.addjob = function(user, data, callback) {
    let newJob = new Job();
    newJob.recruiter = user._id;
    Object.keys(data).forEach(dat => {
        if (dat.includes('-')) {
            pri = dat.split('-')
            if (pri.length == 2) {
                newJob[pri[0]][pri[1]] = data[dat];
                if (dat == "job-location") {
                    console.log(data[dat], newJob);
                }
            } else if (pri.length == 3) {
                newJob[pri[0]][pri[1]][pri[2]] = data[dat];
            }
        } else {
            newJob[dat] = data[dat];
        }
    });
    console.log("job uplodaed", newJob);
    Job.find({}, console.log);
    newJob.save((err, job) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                let error = new Error()
                error.errors = { duplicate: { message: "Email or mobile already registered" } }
                return callback(error, null)
            }
            return callback(err, null);
        }
        return callback(null, job);
    });
}

module.exports.getjobs = function(user, callback) {
    Job.find({"recruiter": user._id}, (err, jobs) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, jobs);
        }
    });
}

module.exports.getjob = function(user, id, callback) {
    Job.findOne({ "_id": new ObjectId(id), "recruiter": user._id }).populate("recruiter").exec((err, job) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, job);
        }
    })
}

module.exports.editjob = function(user, id, data, callback) {
    Job.findOne({ "_id": id, "recruiter": user._id }).populate().exec((err, job) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        if (!job) {
            console.error('No Job found');
            let error = new Error("No Job found");
            return callback(error, null)
        }
        Object.keys(data).forEach(dat => {
            if (dat.includes('-')) {
                pri = dat.split('-')
                if (pri.length == 2) {
                    job[pri[0]][pri[1]] = data[dat];
                } else if (pri.length == 3) {
                    job[pri[0]][pri[1]][pri[2]] = data[dat];
                }
            } else job[dat] = data[dat];
        });
        job.save(err => {
            if (err) {
                console.log('error in save');
                return callback(err, null);
            } else {
                console.log("edited");
                return callback(null, job);
            }
        });
    });
}
