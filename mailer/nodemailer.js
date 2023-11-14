const nodemailer = require('nodemailer');
const { gmailUser, gmailPassword } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
});

const sendMail = async (messageSettings) => {
  try {
    await transporter.sendMail(messageSettings);
  } catch (error) {
    console.error(error);
    throw new Error('Sending failed');
  }
};

module.exports = {
  sendMail,
};
