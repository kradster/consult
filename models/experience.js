'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Experience = new Schema({
    type: {
        type: String,
        time: true,
        enum: ["project", "internship", "job"],
        required: true
    },
    profile: { 
        type: Schema.Types.ObjectId, ref: 'Profile',
        required: true
    },
    role: {
        type: String,
        trim: true,
        required: true
    },
    organization: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
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