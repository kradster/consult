var Subscriber = require('../models/subscriber');

module.exports.subscribe_email = function(email, name, callback) {

    let newsubscriber = new Subscriber({
        email: email,
        name: name
    });
    newsubscriber.save((err, subscriber) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                let error = new Error();
                console.log(err);
                error.message = "Email or mobile already registered";
                return callback(error, null);
            }
            return callback(err, null);
        }

        console.log(email, "successfully subscribed");
        callback(null, subscriber);
    });
}