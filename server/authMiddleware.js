// This middleware will now check for a UUID instead of a JWT token
module.exports = function authMiddleware(req, res, next) {
  try {
    // This assumes the UUID is sent in the Authorization header as a Bearer token
    const uuid = req.headers.authorization.split(' ')[1]; 
    if (uuid) {
      req.userId = uuid; // Attach the UUID to the request object
      next();
    } else {
      throw new Error('Authentication UUID is missing');
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};


