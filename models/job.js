'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Job = new Schema({
    recruiter: { 
        type: Schema.Types.ObjectId, ref: 'User'
    },
    altemail: {
        type: String,
        required: false,
        trim: true,
        validate: {
            isAsync: false,
            validator: validator.isEmail,
            message: 'Please fill a valid email address'
        }
    },
    contactno: {
        type: String,
        required: true,
        trim: true,
        maxlength: [10, "Mobile Number can be of 10 digits only."],
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
        maxlength: 20
    },
    companyname: {
        type: String,
        trim: true,
        maxlength: 20
    },
    aboutcompany: {
        type: String,
        trim: true,
        maxlength: 200
    },
    location: {
        type: String,
        trim: true,
        maxlength: 50
    },
    jobdesc: {
        type: String,
        trim: true,
        maxlength: 100
    },
    companywebsite: {
        type: String,
        trim: true,
        maxlength: 20,
        validate:{
            validator: validate.isURL,
            message: "Not a valid URL"
        }
    },
    location: {
        type: String,
        trim: true,
        maxlength: 20
    },
    jobdesc: {
        type: String,
        trim: true,
        maxlength: 20
    },
    experience: {
        minexp: {
            type: [Number, "Wrong type"],
        },
        maxexp: {
            type: [Number, "Wrong type"],
        }
    },
    salary: {
        type: [Number, "Wrong type"]
    },
    dateofjoin: {
        type: Date,
        required: false
    },
    vacancies: {
        type: Number,
        required: [true, "Vacancies are mandatory"]
    }
});

module.exports = mongoose.model('Job', Job);