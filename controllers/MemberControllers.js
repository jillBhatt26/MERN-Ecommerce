// Requires
// ----------------------------------

// models
const Member = require('../models/Member');
const Seller = require('../models/Seller');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const MemberInfo = require('../models/MemberInfo');

// bcrypt
const { genSalt, hash, compare } = require('bcrypt');

// functions
const GenerateToken = require('../functions/GenerateToken');

// file-system
const fs = require('fs');

// Controllers Definitions
// ----------------------------------

const SignUp = async (req, res) => {
    let { username, email, password } = req.body;

    if (username && email && password) {
        const salt = await genSalt();

        if (salt) {
            password = await hash(password, salt);

            try {
                const member = await Member.create({
                    username,
                    email,
                    password
                });

                let cart = null;

                // Create a cart for user whenever a sign up happens
                try {
                    cart = await Cart.create({ member_id: member._id });
                } catch (err) {
                    res.status(500).json({ errMsg: err.message });
                }

                // member info
                let memberInfo = null;

                try {
                    memberInfo = await MemberInfo.create({
                        member_id: member._id
                    });
                } catch (err) {
                    res.json({ isAuth: false, errMsg: err.message });
                }

                const token = await GenerateToken(member._id);

                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 3 * 24 * 60 * 60 * 100
                });

                res.status(200).json({
                    member_id: member._id,
                    username: member.username,
                    cart,
                    memberInfo
                });
            } catch (err) {
                if (err.code === 11000) {
                    res.status(400).json({ errMsg: 'Username already taken.' });
                } else {
                    res.status(500).json({ errMSg: err.message });
                }
            }
        } else {
            res.status(500).json({ errMsg: 'Cannot generate salt.' });
        }
    } else {
        res.status(400).json({ errMsg: 'All fields required!' });
    }
};

const Login = async (req, res) => {
    const { username, password } = req.body;

    let member = null;

    if (username && password) {
        try {
            member = await Member.findOne({ username });
        } catch (err) {
            res.status(500).json({ errMsg: 'Cannot fetch the user.' });
        }

        if (member) {
            const isPwdCorrect = await compare(password, member.password);

            if (isPwdCorrect) {
                const token = GenerateToken(member._id);

                res.cookie('jwt', token, {
                    httpOnly: true,
                    maxAge: 3 * 24 * 60 * 60 * 100
                });

                // check if the member is a seller
                let seller = null;
                let isSeller = false;

                try {
                    seller = await Seller.findOne({
                        member_id: member._id
                    });
                } catch (err) {
                    res.json({ isAuth: true, errMsg: err.message });
                }

                if (seller) {
                    isSeller = true;
                }

                res.status(200).json({
                    member_id: member._id,
                    username: member.username,
                    isSeller
                });
            } else {
                res.status(400).json({ errMsg: 'Password is incorrect!' });
            }
        } else {
            res.status(400).json({ errMsg: 'User not found.' });
        }
    } else {
        res.status(400).json({ errMsg: 'All fields required!!' });
    }
};

const Logout = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, maxAge: 1 });
    res.status(200).json({ msg: 'Logged Out!' });
};

const LoggedInUser = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // check if member is also a seller
            let seller = null;
            let isSeller = false;

            try {
                seller = await Seller.findOne({
                    member_id: member.member_id
                });

                if (seller) {
                    isSeller = true;
                }

                res.status(200).json({ member, isSeller });
            } catch (err) {
                res.json({ isAuth: true, member, errMsg: err.message });
            }
        } else {
            // res.status(400).json({ errMsg: 'No user logged in.' });
            res.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
        // res.status(400).json({ errMsg: 'No token provided.' });
    }
};

const SellerSignUp = async (req, res) => {
    // get the token from cookies
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            const { name, phone, address, GSTIN, PAN, bankAccNo } = req.body;

            if (name && phone && address && GSTIN && PAN && bankAccNo) {
                // validate GSTIN

                if (GSTIN.includes(PAN, 2) && GSTIN.includes('Z', 13)) {
                    // All Validations Passed: Sign Up as Seller
                    try {
                        const seller = await Seller.create({
                            member_id: member.member_id,
                            name,
                            phone,
                            address,
                            GSTIN,
                            PAN,
                            bankAccNo
                        });

                        // TODO: create a SalesMetrics entry of the seller in the database

                        const SalesMetrics = await SalesMetrics.create({
                            seller_id: seller._id
                        });

                        // TODO: create a folder with the seller._id to store the product images
                        const sellerFolderPath = `./client/public/uploads/${seller._id}`;

                        fs.mkdirSync(sellerFolderPath);

                        res.status(200).json({
                            seller: {
                                member_id: member.member_id,
                                seller_id: seller._id,
                                name: seller.name,
                                phone: seller.phone
                            }
                        });
                    } catch (err) {
                        if (err.code === 11000) {
                            res.status(400).json({
                                errMsg:
                                    'Seller already exists with the provided information.'
                            });
                        } else {
                            res.status(500).json({ errMsg: err.message });
                        }
                    }
                } else {
                    res.status(400).json({ errMsg: 'GSTIN is invalid.' });
                }
            } else {
                res.status(400).json({
                    errMsg: 'Please send necessary information.'
                });
            }
        } else {
            res.status(400).json({ errMsg: 'Member authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'Member authentication failed.' });
    }
};

const GetSellerInfo = (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const seller = req.seller;

        if (seller) {
            res.status(200).json({ seller, isSeller: true });
        } else {
            // res.status(400).json({ isSeller: false });
        }
    } else {
        // res.status(200).json({ errMsg: 'User Authentication failed!' });
    }
};

const GetMemberCart = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            const cart = await Cart.findOne({ member_id: member.member_id });

            res.status(200).json({ cart });
        } else {
            res.status(400).json({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

const CreateOrder = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the products in the cart at the time of placing the order
            try {
                const cart = await Cart.findOne({
                    member_id: member.member_id
                });

                // res.status(200).json({ cart });

                if (cart.products.length) {
                    cart.products.forEach(async product => {
                        try {
                            await Order.create({
                                member_id: member.member_id,
                                product_id: product.product_id,
                                seller_id: product.seller_id,
                                quantity: product.quantity
                            });
                        } catch (err) {
                            res.status(500).json({ errMsg: err.message });
                        }
                    });

                    res.status(200).json({ success: 'Orders Placed!' });
                } else {
                    res.status(400).json({ errMsg: 'Cart cannot be empty.' });
                }
            } catch (err) {
                res.status(500).json({ errMsg: err.message });
            }
        } else {
            res.status(400).json({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

const FetchOrdersMember = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            try {
                const order = await Order.findOne({
                    member_id: member.member_id
                });

                res.status(200).json({ order });
            } catch (err) {
                res.status(500).json({ errMsg: err.message });
            }
        } else {
            res.status(400).json({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

const FetchOrdersSeller = async (req, res) => {
    const seller = req.seller;

    if (seller) {
        // fetch the cart products which contain the seller id key in the products array object.
        try {
            const orders = await Order.find({
                seller_id: seller.seller_id
            });

            res.status(200).json({ orders });
        } catch (err) {
            res.status(500).json({ errMsg: err.message });
        }
    } else {
        res.status(400).json({
            errMsg: 'You need to signup for seller account first.'
        });
    }
};

const UpdateOrderSeller = async (req, res) => {
    // set the status of the order to dispatched / delivered / pending etc.
};

const UpdateOrderBuyer = async (req, res) => {
    // increase / decrease quantity of a product
    // add or remove items
    // NOTE: Check if order is not dispatched before updating the order
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;
        if (member) {
            // fetch the quantity from the req.body

            const { quantity } = req.body;

            if (quantity) {
                try {
                    const order = await Order.findOneAndUpdate(
                        { member_id: member.member_id },
                        { quantity }
                    );

                    res.status(200).json({ order });
                } catch (err) {
                    res.status(500).json({ errMsg: err.message });
                }
            } else {
                res.status(400).json({
                    errMsg: 'Insufficient fields provided.'
                });
            }
        } else {
            res.status(400).json({ errMsg: 'Member authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'Member authentication failed!' });
    }
};

const DeleteOrder = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            try {
                const order = await Order.findOneAndDelete({
                    member_id: member.member_id
                });

                res.status(200).json({ order });
            } catch (err) {
                res.status(500).json({ errMsg: err.message });
            }
        } else {
            res.status(400).json({ errMsg: 'User authorization failed!' });
        }
    } else {
        res.status(400).json({ errMsg: 'User authentication required!' });
    }
};

// Member Information Controllers
const FetchMemberInfo = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            try {
                // query the db to fetch the member information using the member id
                const memberInfo = await MemberInfo.findOne({
                    member_id: member.member_id
                });

                res.json({ isAuth: true, memberInfo });
            } catch (err) {
                res.json({ isAuth: true, errMsg: err.message });
            }
        } else {
            res.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const AddNewAddress = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the details from the request body
            const { line_1, line_2, line_3, city, state, pin } = req.body;

            try {
                // update the information
                await MemberInfo.findOneAndUpdate(
                    {
                        member_id: member.member_id
                    },
                    {
                        $set: {
                            address: {
                                line_1,
                                line_2,
                                line_3,
                                pin,
                                city,
                                state
                            }
                        }
                    }
                );
                // fetch the latest data from the db.

                const memberInfo = await MemberInfo.findOne({
                    member_id: member.member_id
                });

                res.json({ isAuth: true, memberInfo });
            } catch (err) {
                console.log('Catch error at AddNewAddress cont.: ', err);
                res.json({ isAuth: true, errMsg: err.message });
            }
        } else {
            res.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

const AddNewContact = async (req, res) => {
    const token = req.cookies.jwt;

    if (token) {
        const member = req.member;

        if (member) {
            // fetch the details from the request body
            const { contactNum } = req.body;

            try {
                // update the information
                try {
                    await MemberInfo.findOneAndUpdate(
                        {
                            member_id: member.member_id
                        },
                        {
                            $set: {
                                contact: {
                                    number: contactNum
                                }
                            }
                        }
                    );
                } catch (err) {
                    console.log('catch error at AddNewNumber cont.: ', err);
                }
                // fetch the latest data from the db.

                const memberInfo = await MemberInfo.findOne({
                    member_id: member.member_id
                });

                res.json({ isAuth: true, memberInfo });
            } catch (err) {
                res.json({ isAuth: true, errMsg: err.message });
            }
        } else {
            res.json({ isAuth: false });
        }
    } else {
        res.json({ isAuth: false });
    }
};

// Controllers Export
// ----------------------------------
module.exports = {
    SignUp,
    Login,
    Logout,
    LoggedInUser,
    SellerSignUp,
    FetchOrdersMember,
    FetchOrdersSeller,
    CreateOrder,
    DeleteOrder,
    UpdateOrderSeller,
    UpdateOrderBuyer,
    GetSellerInfo,
    FetchMemberInfo,
    AddNewAddress,
    AddNewContact
};
