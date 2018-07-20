'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Profile = new Schema({
    user: { 
        type: Schema.Types.ObjectId, ref: 'User',
        unique: true
    },
    experience: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
    details: {
        fathername: {
            type: String,
            trim: true,
            maxlength: 20
        },
        dob: {
            type: Date,
        },
        aadharno: {
            type: Number,
            trim: true,
            maxlength: 12
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"]
        }
    },
    address: {
        full_address: {
            type: String,
            trim: true,
            maxlength: 50    		
        },
        city: {
            type: String,
            trim: true,
            maxlength: 50    		

    	},
        state: {
            type: String,
            enum: ['Andhra Pradesh', 'Uttar Pradesh']
        },
        pincode: {
            type: Number
        }
    },
    education:{
    	high: {
    		institute_name: {
	    		type: String
    		},
    		board: {
    			type: String
    		},
    		marks: {
    			type: Number
    		},
            passing_year: {
                type: Date
            },
            course: {
                type: String
            }
    	},
    	intermediate: {
    		institute_name: {
	    		type: String
    		},
    		board: {
    			type: String
    		},
    		marks: {
    			type: Number
    		},
            passing_year: {
                type: Date
            },
            course: {
                type: String
            }
    	},
    	graduation: {
    		institute_name: {
	    		type: String
    		},
    		board: {
    			type: String
    		},
    		marks: {
    			type: Number
    		},
            passing_year: {
                type: Date
            },
            course: {
                type: String
            }
    	},
    },
    preferred_city: {
        type: String
    },
    skills: [],
}, {timestamps: true}
);

module.exports = mongoose.model('Profile', Profile);