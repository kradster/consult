'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Subscriber = new Schema({
    name: { 
        type: String,
        trim: true,
        required: true
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
    }
});

module.exports = mongoose.model('Subscriber', Subscriber);