const JWT = require('jsonwebtoken');
const { jwtSecret } = require('../config.js');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const { User } = require('../models/user.model.js');

const ExtractJWT = passportJWT.ExtractJwt;
const StrategyJWT = passportJWT.Strategy;
const options = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new StrategyJWT(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (!user || error) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
  };
  const jwttoken = JWT.sign(payload, jwtSecret, { expiresIn: '1h' });
  return jwttoken;
};

module.exports = { generateToken, authMiddleware };
