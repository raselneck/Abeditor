const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};
const cryptIterations = 100000;
const cryptSaltLength = 128;
const cryptKeyLength = 128;
const cryptAlgorithm = 'RSA-SHA512';

// Define the account schema
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[a-zA-Z0-9_-]{4,16}$/,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    // Regex from http://stackoverflow.com/a/46181
    match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },

  githubToken: {
    type: String,
    trim: true,
  },

  salt: {
    type: Buffer,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Checks to see if a user's password matches the given password
const validatePassword = (doc, password, callback) => {
  const pass = doc.password;

  return crypto.pbkdf2(password, doc.salt, cryptIterations, cryptKeyLength, cryptAlgorithm,
    (err, hash) => {
      const hashString = hash.toString('hex');
      if (hashString !== pass) {
        return callback(false);
      }
      return callback(true);
    });
};

// Helper method for converting an account to its session equivalent
AccountSchema.statics.toSession = doc => ({
  username: doc.username,
  /* email: doc.email,*/
  _id: doc._id,
});

// Finds a user by their username
AccountSchema.statics.findByUsername = (name, callback) => {
  const search = { username: name };
  return AccountModel.findOne(search, callback);
};

// Finds a user by their email
AccountSchema.statics.findByEmail = (email, callback) => {
  const search = { email };
  return AccountModel.findOne(search, callback);
};

// Generates a hash for the given password
AccountSchema.statics.generateHash = (password, callback) => {
  const salt = crypto.randomBytes(cryptSaltLength);

  crypto.pbkdf2(password, salt, cryptIterations, cryptKeyLength, cryptAlgorithm, (err, hash) => {
    callback(salt, hash.toString('hex'));
  });
};

// Attempts to authenticate a user with the given username and password
AccountSchema.statics.authenticate = (username, password, callback) =>
  // NOTE - We can also authenticate by email
  AccountModel.findByUsername(username, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback();
    }

    return validatePassword(doc, password, (result) => {
      if (result === true) {
        return callback(null, doc);
      }

      console.log(`Failed to validate password for ${username}`);
      return callback();
    });
  });

// Attempts to change a user's password
AccountSchema.statics.changePassword = (username, oldPassword, newPassword, callback) =>
  AccountModel.authenticate(username, oldPassword, (err, account_) => {
    const account = account_;

    if (err) {
      return callback(err);
    }

    if (!account) {
      const message = `Failed to aithenticate ${username}.`;
      return callback(new Error(message));
    }

    // Now we need to generate the new hash
    return AccountModel.generateHash(newPassword, (salt, hash) => {
      // Update the salt and the password
      account.salt = salt;
      account.password = hash;

      // Now re-save the account
      account.save()
        .then(() => callback())
        .catch(err2 => callback(err2));
    });
  });

// Create the account model
AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;
