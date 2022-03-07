const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  USER_VERIFICATION_TOKEN_SECRET,
} = require("./env");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const ShortUrl = require("./models/url.model");
const User = require("./models/auth.model");
const {
  generateToken,
  gethash,
  comparePassword,
  validateToken,
} = require("./auth");
const validUrl = require("valid-url");
const shortid = require("shortid");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

exports.signup = async (req, res) => {
  // Check we have an email
  let { email, password, firstName, lastName, birthyear } = req.body;
  if (!email) {
    return res.status(202).send({ message: "Missing email!" });
  }
  try {
    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(201).send({
        message: "Email is already in use please login!",
      });
    }
    password = await gethash(password);

    // Step 1 - Create and save the user
    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      firstName,
      lastName,
      password,
      birthyear,
    }).save();

    // Step 2 - Generate a verification token with the user's ID
    const verificationToken = user.generateVerificationToken();

    // Step 3 - Email the user a unique verification link
    const url = `http://localhost:3000/api/verify/${verificationToken}`;
    transporter.sendMail({
      to: email,
      subject: "Verify Account",
      html: `Click <a href = '${url}'>here</a> to confirm your email!`,
    });
    return res.status(200).send({
      message: `Sent a verification email to ${email}! In case if you dont find the mail please check span folder too`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body; // Check we have an email
  if (!email) {
    return res.status(206).send({
      message: "Missing email.",
    });
  }
  try {
    // Step 1 - Verify a user with the email exists
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(205).send({
        message: "User does not exists",
      });
    }

    // Step 2 - Ensure the account has been verified
    if (!user.verified) {
      return res.status(203).send({
        message:
          "Verify your account by going to you email! Kindly check spam folder too",
      });
    }

    //If password matched then login
    const isPasswordMatched = await comparePassword(password, user.password);
    if (!isPasswordMatched) {
      return res.status(204).send({ message: "wrong password" });
    }

    //In case of success generate token
    const token = generateToken(user.email);
    return res.status(200).send({
      message: "User logged in",
      token,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.verify = async (req, res) => {
  const { token } = req.params; // Check we have an token
  if (!token) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }

  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return res.status(500).send(err);
  }
  try {
    // Step 2 - Find user with matching ID

    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }

    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return res.status(200).send({
      message: "Account Verified",
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.forgotPassword = async (req, res) => {
  let isUser = await User.findOne({ email: req.body.email });
  if (isUser === null) {
    res.status(201).json({ message: "User not present please register" });
  } else if (isUser.birthyear != req.body.birthyear) {
    res
      .status(202)
      .json({ message: "User present but birth year guess is wrong" });
  } else {
    let encryptedPassword = await gethash(req.body.password);
    let ans = await User.findByIdAndUpdate(
      { _id: isUser._id },
      { password: encryptedPassword }
    );
    if (ans) res.status(200).json({ message: "Password change successful" });
    else throw ans;
  }
};

exports.addUrl = async function (req, res) {
  try {
    const url = req.body.url;
    if (validUrl.isHttpsUri(url)) {
      const shortVal = shortid.generate(req.body.url);
      const data = await ShortUrl.findOne({ url });
      if (data) {
        res.statusCode = 200;
        res.send({
          message: "Data already present in DB",
          response: data,
          statusCode: 200,
        });
      } else {
        const data = await ShortUrl.create({
          url,
          shortid: shortVal,
        });
        data.save();
        res
          .status(200)
          .send({
            message: "Data added in DB",
            response: data,
            statusCode: 200,
          });
      }
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({
        message: "Internal server error",
        response: err,
        statusCode: 400,
      });
  }
};

exports.getUrl = async function (req, res) {
  try {
    const { short } = req.params;
    const payload = await ShortUrl.findOne(
      { shortid: short },
      { url: 1, _id: 0 }
    );
    if (payload)
      res
        .status(200)
        .json({ message: "full url available", response: payload.url });
    else res.status(201).json({ message: "Invalid URL" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Internal server error", response: err });
  }
};

exports.authenticate = async function (req, res) {
  const token = req.headers["authorization"];
  if (token && validateToken(token)) res.status(200).send("Success");
  else res.status(401).send("Unauthorised access");
};


exports.appRunning = async function(req,res){
  res.send("App is running!!!")
}