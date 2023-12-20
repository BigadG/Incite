const { connect } = require('./database');

async function authMiddleware(req, res, next) {
  try {
    // Extract UUID from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization header is missing'); // Added logging
      throw new Error('Authorization header is missing');
    }

    const authParts = authHeader.split(' ');
    if (authParts[0] !== 'Bearer' || authParts.length !== 2) {
      console.error('Authorization header is not in the correct format'); // Added logging
      throw new Error('Authorization header is not in the correct format');
    }

    const uuid = authParts[1].trim(); // Added trim to remove any whitespaces
    if (!uuid) {
      console.error('UUID is missing'); // Added logging
      throw new Error('UUID is missing');
    }

    console.log(`Attempting to authenticate UUID: ${uuid}`); // Added logging

    // Validate UUID (optional: check if it exists in the database)
    const db = await connect();
    if (!db) {
      console.error('Database connection failed'); // Added logging
      throw new Error('Database connection failed');
    }
    
    const user = await db.collection('Users').findOne({ uuid });
    if (!user) {
      console.error(`Invalid UUID: ${uuid}`); // Added logging
      throw new Error('Invalid UUID');
    }

    // Attach UUID to the request object
    req.userId = uuid;

    // Pass control to the next middleware
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error.message); // Added logging
    // Respond with an error if UUID is missing or invalid
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
}

module.exports = authMiddleware;




