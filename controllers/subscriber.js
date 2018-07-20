var Subscriber = require('../models/subscriber');

module.exports.subscribe_email = function(email, name, callback) {

    let subscriber = new Subscriber({
        email: email,
        name: name
    });
    subscriber.save((err, subscriber) => {
        if (err) {
            console.log(err);
            return callback(err, null);
        }
        console.log(email, "successfully subscribed");
        callback(null, subscriber);
    });
}