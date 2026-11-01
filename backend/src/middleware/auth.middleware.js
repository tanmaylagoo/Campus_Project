const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const BlacklistToken = require('../models/blacklist.model.js');

// Protect routes - verifies token and sets req.user
const protect = async (req, res, next) => {
    try {
        // Extract token from cookies or authorization header
        const authHeader = req.headers?.authorization;
        let token = req.cookies?.token;

        if (!token && authHeader) {
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
            } else {
                token = authHeader.trim();
            }
        }

        if (!token && req.headers?.token) {
            token = req.headers.token.trim();
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        // Check if token was blacklisted (logged out)
        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ success: false, message: 'Token expired or invalid' });
        }

        // Verify token payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and attach to request
        req.user = await User.findById(decoded._id);
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.token = token; // Attach token for the logout controller
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Optional auth - attaches user if valid token exists, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers?.authorization;
        let token = req.cookies?.token;

        if (!token && authHeader) {
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
            } else {
                token = authHeader.trim();
            }
        }

        if (!token && req.headers?.token) {
            token = req.headers.token.trim();
        }

        if (!token) {
            req.user = null;
            return next();
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded._id);
        req.token = token;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Role authorization - restricts access based on user role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Insufficient permissions' 
            });
        }
        next();
    };
};

module.exports = {
    protect,
    optionalAuth,
    authorize
};
