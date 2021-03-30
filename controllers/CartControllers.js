// Requires
// ----------------------------------
const Cart = require('../models/Cart');

// Controller Definitions
// ----------------------------------
const AddProductToCart = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the cart of the member
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                if (cart) {
                    // fetch the products already stored in cart
                    const cartItems = cart.products;

                    // fetch the product to be added details from req body
                    const { product_id, seller_id } = req.body;

                    const isItemAdded = cartItems.find(
                        item => item.product_id == product_id
                    );

                    if (isItemAdded) {
                        res.status(200).json({
                            itemExists: true,
                            isAuth: true
                        });
                    } else {
                        try {
                            await Cart.findOneAndUpdate(
                                { member_id: member.member_id },
                                {
                                    $addToSet: {
                                        products: {
                                            product_id,
                                            quantity: 1,
                                            seller_id
                                        }
                                    }
                                }
                            );

                            // fetch the updated cart
                            const cart = await Cart.findOne({
                                member_id: member.member_id
                            });

                            res.status(200).json({ cart, isAuth: true });
                        } catch (err) {
                            res.status(500).json({
                                errMsg: err.message,
                                isAuth: true
                            });
                        }
                    }
                } else {
                    res.status(400).json({ errMsg: 'Cannot fetch the cart.' });
                }
            } catch (err) {
                res.status(500).json({ errMsg: err.message });
            }
        } else {
            res.status(400).json({
                isAuth: false
            });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const GetCartProducts = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                const products = cart.products;

                res.json({ products });
            } catch (err) {
                res.json({ errMsg: err.message });
            }
        } else {
            res.json({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.json({ errMsg: 'User authentication required!' });
    }
};

const RemoveProductFromCart = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch cart
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                if (cart) {
                    // fetch the quantity details from request body
                    const { product_id } = req.body;

                    if (product_id) {
                        try {
                            await Cart.findOneAndUpdate(
                                { member_id: member.member_id },
                                {
                                    $pull: {
                                        products: {
                                            product_id
                                        }
                                    }
                                }
                            );

                            const cart = await Cart.findOne({
                                member_id: member.member_id
                            });

                            res.status(200).json({ cart });
                        } catch (err) {
                            res.status(500).json({ errMsg: err.message });
                        }
                    } else {
                        res.status(400).json({
                            errMsg: 'Insufficient fields provided.'
                        });
                    }
                } else {
                    res.status(500).json({
                        errMsg: 'Failed to fetch cart details.'
                    });
                }
            } catch (err) {
                res.status(400).json({ errMsg: err.message });
            }
        } else {
            res.status({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

const UpdateProductInCart = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch cart
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                if (cart) {
                    // fetch the quantity details from request body
                    const { product_id, quantity } = req.body;

                    // fetch the products already stored in cart
                    const cartItems = cart.products;

                    const isItemAdded = cartItems.find(
                        item => item.product_id == product_id
                    );

                    if (product_id && quantity) {
                        if (isItemAdded) {
                            try {
                                await Cart.updateOne(
                                    {
                                        member_id: member.member_id,
                                        'products.product_id': product_id
                                    },
                                    {
                                        $set: {
                                            'products.$.product_id': product_id,
                                            'products.$.quantity': quantity
                                        }
                                    }
                                );

                                // await Cart.findOneAndUpdate(
                                //     { member_id: member.member_id },
                                //     {
                                //         $set: {
                                //             products: {
                                //                 product_id,
                                //                 quantity
                                //             }
                                //         }
                                //     }
                                // );

                                const cart = await Cart.findOne({
                                    member_id: member.member_id
                                });

                                res.status(200).json({ cart });
                            } catch (err) {
                                res.status(500).json({ errMsg: err.message });
                            }
                        } else {
                            console.log('item not found in cart.');
                            res.status(400).json({
                                errMsg: 'Item not present in the cart.'
                            });
                        }
                    } else {
                        res.status(400).json({
                            errMsg: 'Insufficient fields provided.'
                        });
                    }
                } else {
                    res.status(500).json({
                        errMsg: 'Failed to fetch cart details.'
                    });
                }
            } catch (err) {
                res.status(400).json({ errMsg: err.message });
            }
        } else {
            res.status({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

const EmptyCart = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch cart
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                if (cart) {
                    try {
                        await Cart.findOneAndUpdate(
                            { member_id: member.member_id },
                            {
                                $set: {
                                    products: []
                                }
                            }
                        );

                        const cart = await Cart.findOne({
                            member_id: member.member_id
                        });

                        res.status(200).json({ cart });
                    } catch (err) {
                        res.status(500).json({ errMsg: err.message });
                    }
                } else {
                    res.status(500).json({
                        errMsg: 'Failed to fetch cart details.'
                    });
                }
            } catch (err) {
                res.status(400).json({
                    errMsg: err.message
                });
            }
        } else {
            res.status({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

// Controller Exports
// ----------------------------------
module.exports = {
    AddProductToCart,
    GetCartProducts,
    RemoveProductFromCart,
    UpdateProductInCart,
    EmptyCart
};
