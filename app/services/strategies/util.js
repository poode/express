const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { REFRESH_TOKEN_EXPIRY, ACCESS_TOKEN_EXPIRY } = require('../../../config/constant')

const signToken = user => {
  return jwt.sign({ user }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

const signRefreshToken = user => {
  return jwt.sign({ user }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

const hashPassword = async password => {
  if (!password) {
    throw new Error('Password was not provided');
  }

  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

const verifyPassword = async (candidate, actual) => {
  return await bcrypt.compare(candidate, actual);
}

const verifyToken = ({token, type}) => {
  if (!token || !type) {
    throw new Error('token was not provided or type');
  }
  if(!['accessToken', 'refreshToken'].includes(type)) {
    throw new Error('type only can `accessToken` or `refreshToken`');
  }
  const secret = type === 'accessToken' ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET
  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return resolve({ err: err.message });
      }
      const {
        user
      } = decoded;
      if (!user) {
        return resolve({ err: 'invalid token' });
      }
    
      return resolve({ decoded });
    });
  })
}

module.exports = { signToken, hashPassword, verifyPassword, signRefreshToken, verifyToken };
