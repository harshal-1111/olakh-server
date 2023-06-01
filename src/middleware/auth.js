const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  // Get token from header of frontend
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, Authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SERVER_JWT_SECRET);
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
