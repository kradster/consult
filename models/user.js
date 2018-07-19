'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
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
            trim: true,
            max: 20
        },
        second: {
            type: String,
            trim: true,
            max: 20
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        min: [4, "Password must be of 4 digits"],
        max: [16, "Password cannot be greater than 16 digits"]
    },
    phoneno: {
        type: String,
        required: true,
        trim: true,
        max: [10, "Mobile Number can be of 10 digits only."],
        validate: {
            validator: validator.isInt,
            message: '{VALUE} is not a valid phone number!'
        }
    },
    verified: {
        type: Boolean,
        default: false,

    }
});

User.virtual('fullname').get(function(){
    return this.name.first + ' ' + this.name.second;
});

module.exports = mongoose.model('User', User, 'User');