var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id).populate({path: 'profile', populate: {path: 'experience', model: 'Experience', populate: {path: "experience"}}}).exec(function(err, user) {
            done(err, user);
            //.populate({path: 'applied_tests', populate: {path: 'test', models: "Test", populate: {path: "test"}}})
        });
    });

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) { // callback with email and password from our form
        User.findOne({ 'email' :  email }, function(err, user) {
            if (err){
                return done(err);
            }
            if (!user){
            	req.session.messages.push(['No email found', 'red']);
                return done(null, false); // req.flash is the way to set flashdata using connect-flash
            }
            if (!user.validPassword(password)){
            	req.session.messages.push(['Wrong Password', 'red']);
                return done(null, false); // create the loginMessage and save it to session as flashdata
            }
            return done(null, user);
        });

    }));

};