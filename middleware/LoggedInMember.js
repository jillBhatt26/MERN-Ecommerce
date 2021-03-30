// Requires
// --------------------------------------

const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const LoggedInMember = (req, res, next) => {
    // fetch the jwt token from cookies
    const token = req.cookies.jwt;

    if (token) {
        // verify the jwt token
        jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
            if (err) {
                req.member = null;
                next();
            } else {
                // fetch the user from id of decoded token
                try {
                    const member = await Member.findById(
                        decodedToken.member_id
                    );

                    req.member = {
                        member_id: member._id,
                        username: member.username
                    };

                    next();
                } catch (err) {
                    req.member = null;
                    next();
                }
            }
        });
    } else {
        // no token provided: user not logged in.
        req.member = null;
        next();
    }
};

module.exports = LoggedInMember;
