// Requires
// ----------------------------------
const Product = require('../models/Product');
const mongoose = require('mongoose');

const fs = require('fs');
const ProductReview = require('../models/ProductReview');

// Controllers Definitions
// ----------------------------------

const FetchAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});

        res.status(200).json({ products });
    } catch (err) {
        res.status(400).json({ errMsg: err.message });
    }
};

const FetchProduct = async (req, res) => {
    const product_id = req.params.id;

    try {
        const product = await Product.findById(product_id);

        res.status(200).json({ product });
    } catch (err) {
        res.status(500).json({ errMsg: err.message });
    }
};

const FetchProductsBySeller = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const seller = req.seller;

        if (seller) {
            const products = await Product.find({
                seller_id: seller.seller_id
            });

            res.status(200).json({ products });
        } else {
            res.status(400).json({
                errMsg: 'You need to signup for a seller account first.'
            });
        }
    } else {
        res.status(200).json({ errMsg: 'You need to login first.' });
    }
};

const SearchProduct = async (req, res) => {
    // find the products using particular fields

    const { q } = req.query;

    let matches = [];

    if (q) {
        try {
            // find product through product name
            const nameMatches = await Product.find({
                name: {
                    $regex: `.*${q}.*`,
                    $options: 'i'
                }
            });
            nameMatches.forEach(nameMatch => matches.push(nameMatch));

            // find product through product manufacturer
            const manufacturerMatches = await Product.find({
                manufacturer: {
                    $regex: `.*${q}.*`,
                    $options: 'i'
                }
            });

            manufacturerMatches.forEach(manufacturerMatch =>
                matches.push(manufacturerMatch)
            );

            // find product through product category
            const categoryMatches = await Product.find({
                category: {
                    $regex: `.*${q}.*`,
                    $options: 'i'
                }
            });

            categoryMatches.forEach(categoryMatch =>
                matches.push(categoryMatch)
            );

            // find product through product description
            const descriptionMatches = await Product.find({
                description: {
                    $regex: `.*${q}.*`,
                    $options: 'i'
                }
            });

            descriptionMatches.forEach(descriptionMatch =>
                matches.push(descriptionMatch)
            );

            res.json({ matches });
        } catch (err) {
            console.log(err);
            res.json({ matches, errMsg: err.message });
        }
    }
};

const AddNewProduct = async (req, res) => {
    // fetch the token from request cookies
    const token = req.cookies.jwt;

    if (token) {
        // fetch the seller from the request middleware
        const seller = req.seller;

        if (seller) {
            const {
                name,
                manufacturer,
                category,
                mrp,
                sell_price,
                quantity,
                description
            } = req.body;

            // array of arrays first index file name

            const productImageData = Object.entries(req.files).map(
                file => file
            );

            // fetch the images from productImageData
            const [thumbnailData, ...productImagesData] = productImageData;

            // fetching the thumbnail data
            const [thumbnailName, thumbnail] = thumbnailData;

            const imageNames = productImagesData.map(productImageData => {
                const [imgName, img] = productImageData;

                return `${imgName}.jpg`;
            });

            const images = productImagesData.map(productImageData => {
                const [imgName, img] = productImageData;

                return img;
            });

            if (
                name &&
                manufacturer &&
                category &&
                mrp &&
                sell_price &&
                quantity &&
                description &&
                thumbnailName &&
                imageNames
            ) {
                try {
                    const product = await Product.create({
                        name,
                        manufacturer,
                        category,
                        mrp,
                        sell_price,
                        seller_id: seller.seller_id,
                        quantity,
                        description,
                        thumbnail: thumbnail.name
                    });

                    // update the above product object to fill the array of images
                    await imageNames.forEach(async imageName => {
                        await Product.findByIdAndUpdate(product._id, {
                            $addToSet: {
                                images: {
                                    imageName
                                }
                            }
                        });
                    });

                    // move the actual images and the thumbnail to the products folder

                    const productBasePath = `./client/public/uploads/${seller.seller_id}/${product._id}`;

                    fs.mkdirSync(productBasePath);

                    thumbnail.mv(`${productBasePath}/thumbnail.jpg`, err => {
                        if (err) console.log(err);
                    });

                    images.forEach(image => {
                        image.mv(`${productBasePath}/${image.name}`, err => {
                            if (err) console.log(err);
                        });
                    });

                    const newProduct = await Product.findById(product._id);

                    res.status(200).json({ newProduct });
                } catch (err) {
                    console.log(err);
                    res.status(500).json({ errMsg: err.message });
                }
            } else {
                res.status(400).json({ errMsg: 'All fields required!' });
            }
        } else {
            res.status(400).json({
                errMsg: 'You need to signup for a seller account first.'
            });
        }
    } else {
        res.status(400).json({ errMsg: 'You need to login first.' });
    }
};

const DeleteProduct = async (req, res) => {
    // fetch the token
    const token = req.cookies.jwt;

    if (token) {
        // fetch the seller from request
        const seller = req.seller;

        if (seller) {
            // fetch the product id from request params
            const product_id = req.params.id;

            if (product_id) {
                try {
                    await Product.deleteOne({ _id: product_id });

                    res.status(200).json({
                        success: 'Product Deleted Successfully!'
                    });
                } catch (err) {
                    res.status(500).json({ errMsg: err.message });
                }
            } else {
                res.status(400).json({ errMsg: 'Product Id not provided.' });
            }
        } else {
            res.status(400).json({
                errMsg: 'You need to signup for a seller account first.'
            });
        }
    } else {
        res.status(400).json({ errMsg: 'You need to login first' });
    }
};

const UpdateProduct = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const seller = req.seller;

        if (seller) {
            const product_id = req.params.id;

            if (product_id) {
                // fetch the details from the request body
                const { sell_price, quantity } = req.body;

                try {
                    if (sell_price) {
                        await Product.findByIdAndUpdate(product_id, {
                            sell_price
                        });
                    } else if (quantity) {
                        await Product.findByIdAndUpdate(product_id, {
                            quantity
                        });
                    } else {
                        await Product.findByIdAndUpdate(product_id, {
                            sell_price,
                            quantity
                        });
                    }

                    res.status(200).json({
                        success: 'Product information updated!'
                    });
                } catch (err) {
                    res.status(500).json({ errMsg: err.message });
                }
            } else {
                res.status(400).json({
                    errMsg: 'You need to mention the product id.'
                });
            }
        } else {
            res.status(400).json({
                errMsg: 'You need to signup for a seller account first.'
            });
        }
    } else {
        res.status(400).json({ errMsg: 'You need to log in first' });
    }
};

const FetchProductReviews = async (req, res) => {
    // fetch the product id
    const product_id = req.params.id;

    try {
        const reviews = await ProductReview.find({ product_id });

        res.json({ reviews });
    } catch (err) {
        res.json({ errMsg: err.message });
    }
};

const ReviewProduct = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the details from the request body
            const { product_id, rating, review } = req.body;

            const { member_id } = member;

            if (product_id && rating) {
                try {
                    const added_review = await ProductReview.create({
                        member_id,
                        product_id,
                        rating,
                        review
                    });

                    res.json({ isAuth: true, review: added_review });
                } catch (err) {
                    res.json({ isAuth: true, errMsg: err.message });
                }
            } else {
                res.json({ isAuth: true, errMsg: 'Insufficient Fields!' });
            }
        } else {
            res.json({
                isAuth: false,
                errMsg: 'Failed to fetch the member details.'
            });
        }
    } else {
        res.status(400).json({ errMsg: 'You need to log in first' });
    }
};

module.exports = {
    FetchAllProducts,
    FetchProduct,
    FetchProductsBySeller,
    SearchProduct,
    AddNewProduct,
    DeleteProduct,
    UpdateProduct,
    FetchProductReviews,
    ReviewProduct
};
