'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Job = new Schema({
    recruiter: { 
        type: Schema.Types.ObjectId, ref: 'User'
    },
    contact:{
        email: {
            type: String,
            required: false,
            trim: true,
            validate: {
                isAsync: false,
                validator: validator.isEmail,
                message: 'Please fill a valid email address'
            }
        },
        phoneno: {
            type: String,
            required: [true, "Mandatory field"],
            trim: true,
            maxlength: [10, "Mobile Number can be of 10 digits only."],
            validate: {
                validator: validator.isInt,
                message: '{VALUE} is not a valid phone number!'
            }
        },
    },
    approved: {
        type: Boolean,
        default: false,
    },
    company: {
        name: {
            type: String,
            trim: true,
            maxlength: 32
        },
        about:{
            type: String,
            trim: true,
            maxlength: 200
        },
        location: {
            type: String,
            trim: true,
            maxlength: 50
        },
        desc: {
            type: String,
            trim: true,
            maxlength: 100
        },
        website: {
            type: String,
            trim: true,
            maxlength: 20,
            validate:{
                validator: validator.isURL,
                message: "Not a valid URL"
            }
        },
        email: {
            type: String,
            required: false,
            trim: true,
            validate: {
                isAsync: false,
                validator: validator.isEmail,
                message: 'Please fill a valid email address'
            }
        }
    },
    job: {
        title: {
            type: String,
            trim: true,
            maxlength: 20
        },
        description: {
            type: String,
            trim: true,
            maxlength: 20
        },
        salary: {
            min: {
                type: Number,
                required: false
            },
            max: {
                type: Number,
                required: [true, "Max salary mandatory"]
            }
        },
        experience: {
            type: Number,
            required: [true, "Mandatory Field"]
        },
        joining_date: {
            type: Date,
            required: false
        },
        vacancies: {
            type: Number,
            required: [true, "Vacancies are mandatory"]
        },
        location: {
            type: String
        }
    }
});

module.exports = mongoose.model('Job', Job);