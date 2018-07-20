var User = require('../models/user');
var Profile = require('../models/profile');
var Job = require('../models/job');

module.exports.addjob = function(user, data, callback) {
    let newJob = new Job();
        newJob.recruiter = user._id;
        Object.keys(data).forEach(dat => {
            if (dat.includes('-')){
                pri = dat.split('-')
                if (pri.length == 2){
                    newJob[pri[0]][pri[1]] = data[dat];
                }
                else if (pri.length == 3){
                    newJob[pri[0]][pri[1]][pri[2]] = data[dat];
                }
            }
            else{
                newJob[dat] = data[dat];
            }
        })
        newJob.save((err, profile) => {
            if (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    let error = new Error()
                    error.errors = { duplicate: { message: "Email or mobile already registered" } }
                    return callback(error, null)
                }
                return callback(err, null)
            }
        });
}