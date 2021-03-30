// Requires
// -------------------------------------
const jwt = require('jsonwebtoken');

const GenerateToken = member_id => {
    const maxAge = 3 * 24 * 60 * 60;

    return jwt.sign({ member_id }, process.env.SECRET, { expiresIn: maxAge });
};

module.exports = GenerateToken;
