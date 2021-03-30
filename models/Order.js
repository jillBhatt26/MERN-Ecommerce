// Requires
// ----------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// ----------------------------------
const OrderSchema = new Schema({
    member_id: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sell_price: {
        type: String,
        required: true
    },
    status: {
        type: String,
        trim: true,
        required: true,
        default: 'placed'
    }
});

// const OrderSchema = new Schema({
//     member_id: {
//         type: Schema.Types.ObjectId,
//         ref: 'Member',
//         required: true
//     },
//     products: [
//         {
//             product_id: {
//                 type: Schema.Types.ObjectId,
//                 ref: 'Product',
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 required: true
//             },
//             seller_id: {
//                 type: Schema.Types.ObjectId,
//                 ref: 'Seller',
//                 required: true
//             }
//         }
//     ],
//     status: {
//         type: String,
//         trim: true,
//         required: true
//     }
// });

// model creation
// ----------------------------------
const Order = model('Order', OrderSchema);

// model export
// ----------------------------------
module.exports = Order;
