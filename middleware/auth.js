let User = require('../models/userModel');
let jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            alert('User is not authenticated');
            return;
        }
        let decodedToken = jwt.verify(token, 'subhra@28')
        let user = await User.findByPk(decodedToken.userId)

        if (!user) {
            res.json({ message: 'Authentication issue' })
        }
        req.user = user;
        next()
    }
    catch (err) {
        res.json({ message: 'Something wrong is auth.js' })
    }
}