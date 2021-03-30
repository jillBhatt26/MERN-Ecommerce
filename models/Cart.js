// Requires
// ----------------------------------
const mongoose = require('mongoose');
// Schema Definition
// ----------------------------------

const CartSchema = new mongoose.Schema({
    member_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    products: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            seller_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Seller',
                require: true
            }
        }
    ]
});

// Model Creation
// ----------------------------------
const Cart = mongoose.model('Cart', CartSchema);

// Model export
// ----------------------------------
module.exports = Cart;
