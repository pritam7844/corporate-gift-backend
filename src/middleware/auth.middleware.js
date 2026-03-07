import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';

export const isLoggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Decode the token (which now contains id, role, and companyId)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object for the next controllers to use
    req.user = {
      id: decoded.id,
      role: decoded.role,
      companyId: decoded.companyId // CRITICAL: Now available for your other routes
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};