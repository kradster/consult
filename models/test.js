'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test = new Schema({
    admin: { 
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    job: {
        type: [String],
        required: [true, "Mandatory field"]
    },
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    location: {
        type: String,
        trim: true,
        required: [true, "Location is required"]
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Title of JL is required"]
    }

});

module.exports = mongoose.model('Test', Test);