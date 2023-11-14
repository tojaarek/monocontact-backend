const express = require('express');
const {
  signUpHandler,
  signInHandler,
  signOutHandler,
  currentHandler,
  updateUserSubscription,
  updateUserAvatar,
  verifyHandler,
  reVerificationHandler,
} = require('../../controllers/users.controller');
const {
  userValidationMiddleware,
} = require('../../middleware/users.validator');
const { authMiddleware } = require('../../auth/auth.service.js');
const { upload } = require('../../middleware/multer.js');

const usersRouter = express.Router();

usersRouter.post('/signup', userValidationMiddleware, signUpHandler);
usersRouter.post('/signin', userValidationMiddleware, signInHandler);
usersRouter.post('/signout', authMiddleware, signOutHandler);
usersRouter.post('/verify', reVerificationHandler);
usersRouter.get('/current', authMiddleware, currentHandler);
usersRouter.get('/verify/:verificationToken', verifyHandler);
usersRouter.patch(
  '/avatars',
  authMiddleware,
  upload.single('avatar'),
  updateUserAvatar
);
usersRouter.patch('/:userId', authMiddleware, updateUserSubscription);

module.exports = usersRouter;
