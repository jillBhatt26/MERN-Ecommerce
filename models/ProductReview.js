// Requires
// --------------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// --------------------------------------
const ProductReviewsSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    member_id: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        trim: true
    }
});

// Model creation
// --------------------------------------
const ProductReview = model('ProductReview', ProductReviewsSchema);

// Model Export
// --------------------------------------
module.exports = ProductReview;
