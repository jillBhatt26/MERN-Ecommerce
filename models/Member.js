// Requires
// ----------------------------------
const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');

// Schema Definition
// ----------------------------------
const MemberSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: [true, 'Username already in use.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        validate: [isEmail, 'email should be in correct format'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minLength: 6,
        trim: true
    }
});

// Model Creation
// ----------------------------------
const Member = model('Member', MemberSchema);

// Model Export
// ----------------------------------
module.exports = Member;
