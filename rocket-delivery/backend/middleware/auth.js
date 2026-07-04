const jwt = require('jsonwebtoken');
const Astronaut = require('../models/User');

const requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Astronaut.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'Session expired, please sign in again' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Mission Control access required' });
  }
};

module.exports = { requireAuth, requireAdmin };
