const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, '1234');
};

const verifyToken = (token) => {
    return jwt.verify(token, '1234');
};

module.exports = { generateToken, verifyToken };
