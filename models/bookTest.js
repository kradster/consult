'use strict';

var validator = require('validator');
let bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookTest = new Schema({
	user: {
		type: Schema.Types.ObjectId, 
        ref: 'User'
	},
	test: {
        type: Schema.Types.ObjectId, 
        ref: 'Test'
    },
    job:{
        type: String,
        required: [true, "Job is required"]
    },
    status: {
        type: String,
        enum: ["INACTIVE","PENDING", "CLOSED", "ABSENT", "FAILED", "PASSED"],
        default: "INACTIVE"
    },
    marks: {
        type: Number
    },
    rank: {
        type: Number
    },
    applying_date: {
        type: Date
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    payment_done: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('BookTest', BookTest);