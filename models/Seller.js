// Requires
// ----------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// ----------------------------------
const SellerSchema = new Schema({
    member_id: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required to sell products.']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number.'],
        length: [10, 'Phone number should be 10 digits long.'],
        unique: [true, 'Please check your phone number.']
    },
    address: {
        type: String,
        required: [true, 'Please provide location of the store / company.']
    },
    GSTIN: {
        type: String,
        required: [true, 'GSTIN number is required.'],
        length: [15, 'GSTIN number must be 15 digits long.'],
        unique: [true, 'Please check your GSTIN number']
    },
    PAN: {
        type: String,
        required: [true, 'PAN Number is required to sell products.'],
        length: [10, 'PAN number must be 10 digits long.'],
        unique: [true, 'PAN Number must be valid and unique.']
    },
    bankAccNo: {
        type: String,
        required: [true, 'Bank Account number is required to sell products.'],
        unique: [true, 'Bank Account number must be valid and unique.'],
        minLength: [8, 'Bank Account number must be at least 8 digits long.']
    }
});

// Model Definition
// ----------------------------------
const Seller = model('Seller', SellerSchema);

// Model Export
// ----------------------------------
module.exports = Seller;
