'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Test = new Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    location: {
        type: String,
        required: [true, "Location is required"]
    }
});

module.exports = mongoose.model('Test', Test);