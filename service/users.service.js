const { User } = require('../models/user.model.js');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const mimetypes = require('mime-types');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');

class UnknownDatabaseError extends Error {
  constructor() {
    super('Something went wrong at database layer.');
  }
}

const createUser = async (data) => {
  try {
    return await User.create({
      ...data,
      verified: false,
      verificationToken: nanoid(24),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Conflict');
    }
    throw error;
  }
};

const getUser = async (filter) => {
  try {
    const user = await User.findOne(filter);
    console.log(user);
    return user;
  } catch (error) {
    console.error(error);
    throw new UnknownDatabaseError();
  }
};

const updateUser = async (_id, data) => {
  try {
    return await User.findByIdAndUpdate(_id, data, { new: true });
  } catch (error) {
    console.error(error);
    throw new UnknownDatabaseError();
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error(error);
    throw new UnknownDatabaseError();
  }
};

const createDefaultAvatar = async (email) => {
  try {
    const avatar = await gravatar.url(
      email,
      {
        default: 'robohash',
      },
      true
    );
    return avatar;
  } catch (error) {
    console.error(error);
    throw new UnknownDatabaseError();
  }
};

const changeAvatarFile = async (filePath, _id, mimetype) => {
  try {
    const fileName = `${_id}_avatar.${mimetypes.extension(mimetype)}`;
    const avatarImage = await Jimp.read(filePath);
    await avatarImage.resize(250, 250).writeAsync(filePath);
    await fs.rename(
      filePath,
      path.join(__dirname, '..', 'public/avatars', fileName)
    );
    return fileName;
  } catch (error) {
    console.error(error);
    throw new UnknownDatabaseError();
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  getUserById,
  createDefaultAvatar,
  changeAvatarFile,
  UnknownDatabaseError,
};
