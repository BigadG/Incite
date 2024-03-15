const { connect } = require('./database');

async function authMiddleware(req, res, next) {
  try {
    // Extract UUID from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }

    const uuid = authHeader.split(' ')[1];
    if (!uuid) {
      throw new Error('UUID is missing');
    }

    // Validate UUID (optional: check if it exists in the database)
    const db = await connect();
    const user = await db.collection('Users').findOne({ uuid });
    if (!user) {
      throw new Error('Invalid UUID');
    }

    // Attach UUID to the request object
    req.userId = uuid;

    // Pass control to the next middleware
    next();
  } catch (error) {
    console.error('AuthMiddleware Error:', error.message);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
}

module.exports = authMiddleware;
