// Requires
// ----------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// ----------------------------------
const MemberInfoSchema = new Schema({
    member_id: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },

    address: [
        {
            line_1: {
                type: String,
                required: true,
                trim: true
            },
            line_2: {
                type: String,
                trim: true
            },
            line_3: {
                type: String,
                trim: true
            },
            pin: {
                type: String,
                required: true,
                length: 6,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],

    contact: [
        {
            number: {
                type: String,
                length: 10,
                required: true,
                trim: true
            }
        }
    ]
});

// model creation
// ----------------------------------
const MemberInfo = model('MemberInfo', MemberInfoSchema);

// model exports
// ----------------------------------
module.exports = MemberInfo;
