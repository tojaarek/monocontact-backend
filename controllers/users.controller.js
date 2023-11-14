const {
  createUser,
  getUser,
  updateUser,
  createDefaultAvatar,
  changeAvatarFile,
} = require('../service/users.service.js');
const { generateToken } = require('../auth/auth.service.js');
const { sendVerificationMessage } = require('../service/mailer.service.js');

const signUpHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const avatarURL = await createDefaultAvatar(email);
    const { subscription, verificationToken } = await createUser({
      email,
      password,
      avatarURL,
    });

    await sendVerificationMessage(email, verificationToken);

    return res.status(201).json({
      status: 'success',
      code: 201,
      message: 'User created',
      data: {
        email: email,
        subscription: subscription,
        avatar: avatarURL,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.message === 'Conflict') {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'Email is already in use',
        data: 'Conflict',
      });
    }
    return next(error);
  }
};

const signInHandler = async (req, res, next) => {
  try {
    const user = await getUser({ email: req.body.email });
    const isPasswordValid = await user.validatePassword(req.body.password);
    if (!user || !isPasswordValid) {
      return res.status(401).json({
        status: 'Unauthorized',
        code: 401,
        message: 'Incorrect email or password',
      });
    }
    if (!user.verified) {
      return res.status(403).json({
        status: 'Forbidden',
        code: 403,
        message: 'User not verified',
      });
    }
    const userPayload = {
      _id: user._id,
      email: user.email,
      subscription: user.subscription,
      avatar: user.avatarURL,
    };

    const token = generateToken(userPayload);
    await updateUser(user._id, { token });

    return res.status(200).json({
      status: 'OK',
      code: 200,
      token: token,
      user: {
        email: userPayload.email,
        subscription: userPayload.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const signOutHandler = async (req, res, next) => {
  try {
    await updateUser(req.user._id, { token: null });

    return res.status(204).json({
      status: 'OK',
      code: 204,
    });
  } catch (error) {
    return next(error);
  }
};

const currentHandler = async (req, res, next) => {
  try {
    const { email, subscription } = await getUser(req.body.email);
    return res.status(200).json({
      status: 'OK',
      code: 200,
      user: {
        email: email,
        subscription: subscription,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const updateUserSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    if (!['starter', 'pro', 'business'].includes(subscription)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Invalid subscription type',
      });
    }

    const updatedUser = await updateUser(req.user._id, { subscription });

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        code: 404,
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        updatedUser,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    const filePath = req.file.path;
    const id = req.user._id;
    const mimetype = req.file.mimetype;
    const avatar = await changeAvatarFile(filePath, id, mimetype);
    const updatedUser = await updateUser(id, {
      avatarURL: `http://localhost:3000/avatars/${avatar}`,
    });

    return res.status(200).json({
      status: 'success',
      code: 200,
      data: {
        updatedUser,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const verifyHandler = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await getUser({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        code: 404,
        message: 'Verification token is invalid or user does not exist',
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: 'Bad Request',
        code: 400,
        message: 'User has already been verified',
      });
    }

    await updateUser(user._id, { verified: true, verificationToken: null });

    return res.status(200).json({
      status: 'OK',
      code: 200,
      message: 'Verification successful',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const reVerificationHandler = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({
        status: 'Bad Request',
        code: 400,
        message: 'Missing required field email',
      });
    }
    const user = await getUser({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'Not Found',
        code: 404,
        message: 'User not found',
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: 'Bad Request',
        code: 400,
        message: 'User has already been verified',
      });
    }

    await sendVerificationMessage(user.email, user.verificationToken);

    return res.status(200).json({
      status: 'OK',
      code: 200,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = {
  signUpHandler,
  signInHandler,
  signOutHandler,
  currentHandler,
  updateUserSubscription,
  updateUserAvatar,
  verifyHandler,
  reVerificationHandler,
};
