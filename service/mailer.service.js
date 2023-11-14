const { sendMail } = require('../mailer/nodemailer.js');

const sendVerificationMessage = async (email, verificationToken) => {
  const messageSettings = {
    to: email,
    subject: 'Welcome to monoContact',
    text: `Hello! Please verify your monoContact account by visiting http://localhost:3000/users/verify/${verificationToken}`,
    html: `<h2>Hello!</h2><br/>Please verify your monoContact account by clicking <a href="http://localhost:3000/users/verify/${verificationToken}">here</a>!`,
  };

  await sendMail(messageSettings);
};

module.exports = {
  sendVerificationMessage,
};
