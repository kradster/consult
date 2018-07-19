'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//             minexp text,
//             maxexp text,
//             listbyemail text,
//             noofvac text,
//             salary text,
//             experience text,
//             anytime text,
//             dateofjoin text,
//             listingid text,
var Job = new Schema({
    recruiteremail: {
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
    altemail: {
        type: String,
        unique: true,
        required: false,
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
    contactno: {
        type: String,
        required: true,
        trim: true,
        max: [10, "Mobile Number can be of 10 digits only."],
        validate: {
            validator: validator.isInt,
            message: '{VALUE} is not a valid phone number!'
        }
    },
    approved: {
        type: Boolean,
        default: false,
    },
    jobtitle: {
        type: String,
        trim: true,
        max: 20
    },
    companyname: {
        type: String,
        trim: true,
        max: 20
    },
    aboutcompany: {
        type: String,
        trim: true,
        max: 20
    },
    location: {
        type: String,
        trim: true,
        max: 20
    },
    jobdesc: {
        type: String,
        trim: true,
        max: 20
    },
    companywebsite: {
        type: String,
        trim: true,
        max: 20,
        validate:{
            validator: validate.isURL,
            message: "Not a valid URL"
        }
    },
    location: {
        type: String,
        trim: true,
        max: 20
    },
    jobdesc: {
        type: String,
        trim: true,
        max: 20
    },
});

User.virtual('fullname').get(function(){
    return this.name.first + ' ' + this.name.second;
});

module.exports = mongoose.model('User', User, 'User');