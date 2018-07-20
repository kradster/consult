'use strict';

var validator = require('validator');
let bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    profile: {
        type: Schema.Types.ObjectId, ref: 'Profile'
    },
    email: {
        type: String,
        unique: [true, "Email already registered with us"],
        required: [true, "Email is mandatory"],
        trim: true,
        validate: {
            isAsync: false,
            validator: validator.isEmail,
            message: 'Please fill a valid email address'
        }
    },
    name: {
        first: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            max: 20
        },
        last: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            max: 20
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        min: [4, "Password must be of 4 digits"],
        max: [16, "Password cannot be greater than 16 digits"]
    },
    phoneno: {
        type: String,
        unique: [true, "Mobile already registered with us"],
        required: [true, "Phone number is required"],
        trim: true,
        minlength: [10, "Mobile Number can be of 10 digits only."],
        maxlength: [10, "Mobile Number can be of 10 digits only."],
        validate: {
            validator: validator.isInt,
            message: '{VALUE} is not a valid phone number!'
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
}, {timestamps: true}
);

User.virtual('fullname').get(function() {
    return this.name.first + ' ' + this.name.last;
});

User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', User, 'User');