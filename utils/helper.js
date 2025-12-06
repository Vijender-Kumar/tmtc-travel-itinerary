'use strict';

const jwt = require('jsonwebtoken');
const bCrypt = require('bcryptjs');
const rateLimit = require("express-rate-limit");

const comparePassword = async (userPassword, hash) => {
  let isMatch = false;
  await bCrypt.compare(userPassword, hash).then((match) => {
    isMatch = match;
  });
  return isMatch;
};

// Rate Limiter - in Future It can be taken form the .env file as well
const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50, 
    message: {
        success: false,
        message: "Too many requests. Try again in 1 minute."
    }
});


const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email,
  }, process.env.SECRET_KEY, { expiresIn: "1d" });
};

const verifyToken = (token) => {
  try {
    const bearer = token.split(' ');
    const bearerToken = bearer[1];

    const tokenData = jwt.verify(bearerToken, process.env.SECRET_KEY);

    const now = Math.floor(Date.now() / 1000);

    if (now >= tokenData.exp) {
      return { error: "Token expired" };
    }

    return { data: tokenData };

  } catch (error) {
    return { error: "Invalid token" };
  }
};

// for Future reference for validating the Generic Types in the API's

// const validateDataSync = (type, value) => {
//   switch (type) {
//     case 'name': {
//       const name = /^[a-zA-Z]{1,50}$/;
//       return name.test(value);
//     }
//     case 'mobile':
//       const mobile = /^(\d{10})$/;
//       return mobile.test(value);
//     case 'email':
//       const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/;
//       return email.test(value);
//     case 'password':
//       const password = /^[\w\W]{0,16}$/
//       return password.test(value);
//     default:
//       return true;
//   }
// };

module.exports = {
  comparePassword,
  generateToken,
  // validateDataSync,
  verifyToken,
  rateLimiter
};
