const { Strategy } = require('passport-jwt');

const { ServerError } = require('../../util')
const { getUserById } = require('../user');
const { ACCESS_TOKEN_HEADER_NAME, REFRESH_TOKEN_HEADER_NAME } = require('../../../config/constant')

const JWTStrategy = Strategy;

const strategyOptions = ({ headerName, secret }) => ({
  jwtFromRequest: req => {
    if(headerName === ACCESS_TOKEN_HEADER_NAME) return req.get(headerName);
  },
  secretOrKey: secret,
  passReqToCallback: true
});

const verifyCallback = async (req, jwtPayload, done) => {
  const { err, user } = await getUserById(jwtPayload.user.id);

  if (err) {
    return done(new ServerError(err, 404));
  }

  req.user = user
  return done(null, user);
}

exports.jwtStrategyAccess = new JWTStrategy(strategyOptions({headerName: ACCESS_TOKEN_HEADER_NAME, secret: process.env.JWT_ACCESS_SECRET}), verifyCallback);
