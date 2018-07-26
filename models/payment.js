'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Payment = new Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    payment_id: {
        type: String,
        required: true
    },
    test_id: {
        type: Schema.Types.ObjectId, ref: 'Test',
        required: true
    },
    book_id: {
        type: Schema.Types.ObjectId, ref: 'BookTest',
        required: true,
        unique: true
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        requierd: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {timestamps: true}
);

module.exports = mongoose.model('Payment', Payment);