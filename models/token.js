'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const Token = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 86400 }
});

module.exports = mongoose.model('Token', Token);
