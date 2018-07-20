var Test = require('../models/test');

module.exports.createTest = function(user, data, callback) {
    let newTest = new Test({
        admin: user._id,
        job: data.jobs,
        date: data.date,
        location: data.location,
        title: data.title
    });
    newTest.save((err) => {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        console.log("test", newTest);
        return callback(null, newTest);
    });
}

module.exports.getTests = function(callback) {
    Test.find({}).populate('admin').exec((err, tests) =>{
        if (err) return callback(err, null);
        else return callback(null, tests);
    });
}