var Subscriber = require('../models/subscriber');

module.exports.subscribe_email = function(email, name, callback) {

    let newsubscriber = new Subscriber({
        email: email,
        name: name
    });
    newsubscriber.save((err, subscriber) => {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        console.log(email, "successfully subscribed");
        callback(null, subscriber);
    });
}