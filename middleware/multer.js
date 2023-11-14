const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '..', 'tmp'),
  limits: {
    fileSize: 3145728,
  },
});

module.exports = {
  upload,
};
