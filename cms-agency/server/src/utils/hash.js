const bcrypt = require('bcryptjs');

const hash = {
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },
};

module.exports = hash;
