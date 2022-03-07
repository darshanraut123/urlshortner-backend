const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  USER_VERIFICATION_TOKEN_SECRET,
} = require("../env");

const UserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  birthyear: { type: Number, required: true },
  verified: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.generateVerificationToken = function () {
  const user = this;
  const verificationToken = jwt.sign(
    { ID: user._id },
    USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  return verificationToken;
};



module.exports = mongoose.model("User", UserSchema);
