const { generateToken, verifyToken } = require('../utilis/jwtUtils');
const authenticate = (req, res, next) => {
    // console.log('hi')
    const token = req.headers.authorization?.split(' ')[1];
    // console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
        // console.log(decoded);

    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
module.exports = authenticate