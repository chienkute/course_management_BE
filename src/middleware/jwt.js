const jwt = require("jsonwebtoken");
// decode = obejct bỏ vô hash
//  {id and role}
const generateAccessToken = (uid, role) =>
  jwt.sign({ _id: uid, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
const generateRefreshToken = (uid) =>
  jwt.sign({ _id: uid }, process.env.JWT_SECRET, { expiresIn: "7d" });

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
