// Requires
// --------------------------------------
const Seller = require('../models/Seller');

const jwt = require('jsonwebtoken');

// Middleware Definition
// --------------------------------------
const VerifySeller = async (req, res, next) => {
    // fetch the token
    // decode the token
    // fetch the member from the id in the decoded token
    // check if the member is a seller from the id
    // if true, assign the member to request and give a call to the next middleware
    // else assign null to member value in request and give a call to the next middleware

    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                req.seller = null;
                next();
            } else {
                try {
                    const seller = await Seller.findOne({
                        member_id: decodedToken.member_id
                    });

                    req.seller = { seller_id: seller._id, name: seller.name };
                    next();
                } catch (err) {
                    req.seller = null;
                    next();
                }
            }
        });
    } else {
        req.seller = null;
        next();
    }
};

// Middleware Export
// --------------------------------------
module.exports = VerifySeller;
