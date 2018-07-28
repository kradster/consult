'use strict';

var validator = require('validator');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Profile = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    experience: [{
        type: {
            type: String,
            trim: true,
            enum: ["Project", "Internship", "Job"],
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
    }],
    details: {
        father_name: {
            type: String,
            trim: true,
            maxlength: 50
        },
        dob: {
            type: Date,
        },
        aadharno: {
            type: Number,
            trim: true,
            maxlength: [12, "Aadhar number is of 12 digit"],
            minlength: [12, "Aadhar number is of 12 digit"]
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
            enum: ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Orissa', 'Pondicherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttaranchal', 'Uttar Pradesh', 'West Bengal']
        },
        pincode: {
            type: Number
        }
    },
    education: {
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
        post_graduation: {
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
        }
    },
    preferred_city: [String],
    available: {
        type: Date
    },
    skills: []
}, { timestamps: true });

Profile.virtual('getStates').get(function() {
    return this.schema.path('address.state').enumValues
})

module.exports = mongoose.model('Profile', Profile);