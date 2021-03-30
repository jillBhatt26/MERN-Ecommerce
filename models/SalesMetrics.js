// Requires
// --------------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// --------------------------------------
const SalesMetricsSchema = new Schema(
    {
        seller_id: {
            type: Schema.Types.ObjectId,
            ref: 'Seller',
            required: true
        },
        metrics: [
            {
                product_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);
// const SalesMetricsSchema = new Schema(
//     {
//         seller_id: {
//             type: Schema.Types.ObjectId,
//             ref: 'Seller',
//             required: true
//         },
//         product_id: {
//             type: Schema.Types.ObjectId,
//             ref: 'Product',
//             required: true
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             default: 1
//         },
//         income: {
//             type: Number,
//             required: true,
//             default: 1
//         }
//     },
//     { timestamps: true }
// );

// Model Creation
// --------------------------------------
const SalesMetric = model('SalesMetric', SalesMetricsSchema);

// Model Export
// --------------------------------------
module.exports = SalesMetric;
