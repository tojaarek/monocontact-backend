const { signUpHandler, signInHandler } = require('./users.controller.js');
const {
  createDefaultAvatar,
  createUser,
  getUser,
  updateUser,
} = require('../service/users.service.js');
const { User } = require('../models/user.model.js');
const { generateToken } = require('../auth/auth.service.js');

jest.mock('../auth/auth.service.js', () => ({
  generateToken: jest.fn(),
}));

generateToken.mockReturnValue('mocked-token');

jest.mock('../service/users.service.js', () => ({
  createDefaultAvatar: jest.fn(),
  createUser: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
}));

describe('user sign up', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should  allow to create a new user', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    createDefaultAvatar.mockResolvedValue('mocked-avatar-url');
    createUser.mockResolvedValue({ subscription: 'starter' });

    await signUpHandler(reqMock, resMock, nextMock);

    expect(createUser).toHaveBeenCalledWith({
      email: 'test@user.com',
      password: 'TestUser2@',
      avatarURL: 'mocked-avatar-url',
    });
  });

  it('should return a successful response with code 201', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    createDefaultAvatar.mockResolvedValue('mocked-avatar-url');
    createUser.mockResolvedValue({ subscription: 'starter' });

    await signUpHandler(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(201);
    expect(resMock.json).toHaveBeenCalledWith({
      status: 'success',
      code: 201,
      message: 'User created',
      data: {
        email: 'test@user.com',
        subscription: 'starter',
        avatar: 'mocked-avatar-url',
      },
    });
  });

  it('should return a response with an error and code 409 when an email is already registered', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    createDefaultAvatar.mockResolvedValue('mocked-avatar-url');
    createUser.mockRejectedValue(new Error('Conflict'));

    await signUpHandler(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(409);
    expect(resMock.json).toHaveBeenCalledWith({
      status: 'error',
      code: 409,
      message: 'Email is already in use',
      data: 'Conflict',
    });
  });
});

describe('user sign in', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a user from the database', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    const userMock = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: null,
      avatarURL: 'mocked-avatar-url',
    });

    getUser.mockResolvedValue(userMock);

    await signInHandler(reqMock, resMock, nextMock);

    expect(getUser).toHaveBeenCalledWith({ email: 'test@user.com' });
  });

  it('should validate user email and password', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    const userMock = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: null,
      avatarURL: 'mocked-avatar-url',
    });

    getUser.mockResolvedValue(userMock);
    userMock.validatePassword = jest.fn().mockResolvedValue(true);

    await signInHandler(reqMock, resMock, nextMock);

    expect(userMock.validatePassword).toHaveBeenCalledWith('TestUser2@');
  });

  it('should update user token if credentials are correct', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    const userMock = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: null,
      avatarURL: 'mocked-avatar-url',
      verified: true,
    });

    const userMockUpdated = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: 'mocked-token',
      avatarURL: 'mocked-avatar-url',
      verified: true,
    });

    getUser.mockResolvedValue(userMock);
    userMock.validatePassword = jest.fn().mockResolvedValue(true);
    generateToken.mockReturnValue('mocked-token');
    updateUser.mockResolvedValue(userMockUpdated);

    const token = 'mocked-token';

    await signInHandler(reqMock, resMock, nextMock);

    expect(updateUser).toHaveBeenCalledWith(userMock._id, { token });
  });

  it('should return a token and user data if credentials are correct', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser2@' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    const userMock = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: null,
      avatarURL: 'mocked-avatar-url',
      verified: true,
    });

    const userMockUpdated = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: 'mocked-token',
      avatarURL: 'mocked-avatar-url',
      verified: true,
    });

    getUser.mockResolvedValue(userMock);
    userMock.validatePassword = jest.fn().mockResolvedValue(true);
    generateToken.mockReturnValue('mocked-token');
    updateUser.mockResolvedValue(userMockUpdated);

    await signInHandler(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      status: 'OK',
      code: 200,
      token: 'mocked-token',
      user: {
        email: 'test@user.com',
        subscription: 'starter',
      },
    });
  });

  it('should return unauthorized with code 401 if credentials are incorrect', async () => {
    const reqMock = {
      body: { email: 'test@user.com', password: 'TestUser' },
    };

    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const nextMock = jest.fn();

    const userMock = new User({
      _id: '6527db4cf2b88c03d2b2071e',
      email: 'test@user.com',
      subscription: 'starter',
      token: null,
      avatarURL: 'mocked-avatar-url',
    });

    getUser.mockResolvedValue(userMock);
    userMock.validatePassword = jest.fn().mockResolvedValue(false);

    await signInHandler(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({
      status: 'Unauthorized',
      code: 401,
      message: 'Incorrect email or password',
    });
  });
});
