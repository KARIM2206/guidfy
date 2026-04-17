const crypto = require("crypto");
const generateVerificationToken = () => {
 const verificationToken = crypto.randomBytes(32).toString("hex");
 return verificationToken;
}

module.exports = generateVerificationToken
