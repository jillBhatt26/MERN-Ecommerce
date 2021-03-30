// Requires
// ----------------------------------
// models
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Member = require('../models/Member');

// Controllers Definitions
// ----------------------------------

const FetchOrdersMember = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            try {
                const orders = await Order.find({
                    member_id: member.member_id
                });

                res.json({ isAuth: true, orders });
            } catch (err) {
                res.json({ isAuth: true, errMsg: err.message });
            }
        } else {
            req.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const FetchOrdersSeller = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const seller = req.seller;

        if (seller) {
            let orders = [];
            let ordersDetailed = [];

            try {
                orders = await Order.find({
                    seller_id: seller.seller_id
                });
            } catch (err) {
                res.json({ isAuth: true, errMsg: err.message });
            }

            if (orders === null) {
                orders = [];
            } else {
                ordersDetailed = await Promise.all(
                    orders.map(async order => {
                        let orderDetailed = {};

                        const member = await Member.findById(order.member_id);

                        orderDetailed.status = order.status;
                        orderDetailed._id = order._id;
                        orderDetailed.product_id = order.product_id;
                        orderDetailed.seller_id = order.seller_id;
                        orderDetailed.member_id = order.member_id;
                        orderDetailed.quantity = order.quantity;
                        orderDetailed.sell_price = order.sell_price;
                        orderDetailed.username = member.username;
                        orderDetailed.email = member.email;

                        return orderDetailed;
                    })
                );
            }

            orders = ordersDetailed;

            res.json({ isAuth: true, orders });
        } else {
            req.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const PlaceOrder = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the order details from the request body
            const {
                product_id,
                seller_id,
                quantity: qty,
                sell_price
            } = req.body;

            if ((product_id, seller_id, qty)) {
                try {
                    // TODO: check if order for the product is already placed to the seller
                    const exists = await Order.findOne({
                        product_id,
                        seller_id,
                        member_id: member.member_id
                    });

                    if (exists) {
                        res.json({ isAuth: true, orderExists: true });
                    } else {
                        // place the order
                        const order = await Order.create({
                            product_id,
                            seller_id,
                            quantity: qty,
                            member_id: member.member_id,
                            sell_price
                        });

                        // Reduce the number of total quantity of the particular product using product_id
                        await Product.findOneAndUpdate(
                            { _id: product_id },
                            {
                                $inc: {
                                    quantity: -qty
                                }
                            }
                        );

                        // Empty the member's cart
                        await Cart.findOneAndUpdate(
                            { member_id: member.member_id },
                            {
                                $set: {
                                    products: []
                                }
                            }
                        );

                        res.json({ isAuth: true, order });
                    }
                } catch (err) {
                    console.log({
                        isAuth: true,
                        errMsg: err.message,
                        from: 'PlaceOrder'
                    });
                }
            }
        } else {
            req.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const CancelOrder = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the order details from the request body
            const { order_id, quantity: qty, status } = req.body;

            if (order_id && qty && status) {
                if (status === 'placed' || status === 'received') {
                    // cancel the order
                    try {
                        const order = await Order.findByIdAndDelete(order_id);

                        // restore the quantity

                        await Product.findByIdAndUpdate(order.product_id, {
                            $inc: {
                                quantity: +qty
                            }
                        });

                        res.json({ isAuth: true });
                    } catch (err) {
                        console.log({ isAuth: true, errMsg: err.message });
                    }
                } else {
                    res.json({
                        isAuth: true,
                        errMsg: "Order can't be cancelled now."
                    });
                }
            }
        } else {
            req.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const UpdateOrderSeller = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const seller = req.seller;

        if (seller) {
            const { status, order_id } = req.body;

            try {
                await Order.findOneAndUpdate(
                    {
                        seller_id: seller.seller_id,
                        _id: order_id
                    },
                    {
                        status
                    }
                );

                const order = await Order.findById(order_id);

                // 1. check the status, if status is 'received'
                if (status === 'received') {
                    // 1.1 add the product to sales metrics for the

                    // de-structure the fetched order details
                    const {
                        seller_id,
                        product_id,
                        quantity,
                        sell_price
                    } = order;

                    // add the orders
                }

                res.json({ isAuth: true, order });
            } catch (err) {
                res.json({ isAuth: true, errMsg: err.message });
            }
        } else {
            req.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

// Controllers Exports
// ----------------------------------
module.exports = {
    PlaceOrder,
    CancelOrder,
    FetchOrdersMember,
    FetchOrdersSeller,
    UpdateOrderSeller
};
