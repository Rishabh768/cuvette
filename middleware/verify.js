import jwt from 'jsonwebtoken';

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Authorization token is required' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.company = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authenticateJWT;
