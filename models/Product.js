// Requires
// --------------------------------------
const { Schema, model } = require('mongoose');

// Schema Definition
// --------------------------------------

// NOTE: Todo Add image field

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required.'],
        trim: true
    },
    manufacturer: {
        type: String,
        required: [true, "Provide a company / manufacturer's name"],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Product must belong to a category.'],
        trim: true
    },
    mrp: {
        type: String,
        required: [true, 'Product must have a MRP.'],
        trim: true
    },
    sell_price: {
        type: String,
        required: [true, 'Product must have a price.'],
        trim: true
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    images: [
        {
            imageName: {
                type: String,
                required: true,
                trim: true
            }
        }
    ]
});

// Model Creation
// --------------------------------------
const Product = model('Product', ProductSchema);

// Export
// --------------------------------------
module.exports = Product;
