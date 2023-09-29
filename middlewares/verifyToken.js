const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
verifyToken = (req, res, next) => {
  const tokenFromHeader = req.headers.authorization;
  if (!tokenFromHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = tokenFromHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decoded.userId;
    next();
  });
};

module.exports = verifyToken;
