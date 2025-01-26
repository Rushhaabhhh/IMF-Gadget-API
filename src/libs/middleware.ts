const jwt = require('jsonwebtoken');

// Middleware to authenticate and authorize the user
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Token not provided" });
        }

        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = verifiedToken.userId;

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Token Invalid" });
    }
};


module.exports = { authenticateToken };