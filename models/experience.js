'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Experience = new Schema({
    type: {
        type: String,
        enum: ["project", "internship", "job"]
        required: true
    },
    profile: { 
        type: Schema.Types.ObjectId, ref: 'Profile'
        required: true
    },
    role: {
        type: String
        required: true
    },
    organization: {
        type: String
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    }
}, {timestamps: true}
);

module.exports = mongoose.model('Experience', Experience);