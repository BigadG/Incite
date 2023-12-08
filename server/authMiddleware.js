const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET; // Using the secret from the environment variable

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assumes Bearer token
    const decoded = jwt.verify(token, secret);

    // Ensure that your JWT token contains a user ID field, typically as 'userId'.
    // This field should be set when the token is created (usually at the time of login).
    if (decoded && decoded.userId) {
      req.userId = decoded.userId; // Attach the user ID to the request object
      next();
    } else {
      throw new Error('Authentication token is missing user ID');
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = authMiddleware;
