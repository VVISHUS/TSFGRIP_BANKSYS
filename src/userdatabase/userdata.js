const mongoose = require('mongoose');
const passwordValidator = require('password-validator');

// Define password validation schema
const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8) // Minimum length of 8 characters
  .has().uppercase() // Must have at least one uppercase letter
  .has().lowercase() // Must have at least one lowercase letter
  .has().digits() // Must have at least one digit
  .has().not().spaces(); // Should not contain spaces

const users_schema1 = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phnum: {
    type: Number,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        const phoneNumber = value.toString();
        return phoneNumber.length >= 10 && phoneNumber.length <= 13;
      },
      message: 'Phone number must have between 10 to 13 digits.'
    }
  },
  acctype: {
    type: String,
    required: true,
    unique: false
  },
  initial_deposit: {
    type: Number,
    required: true,
    // validate: {
    //   validator: function (value) {
    //     return value >= 3000 && value <= 48000;
    //   },
    //   message: 'Initial deposit must be between 3000 to 48000.'
    // }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return passwordSchema.validate(value);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and no spaces.'
    }
  },
  cpassword: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Confirm password does not match.'
    }
  },
  accountNumber: {
    type: Number,
    unique: true
  }
});

users_schema1.pre('save', async function (next) {
  const self = this;
  try {
    const accountNumber = Math.floor(Math.random() * 10000000000);
    self.accountNumber = accountNumber;
    const duplicateUser = await mongoose.models['users_TSF'].findOne({
      $or: [{ email: self.email }, { phnum: self.phnum }]
    });
    if (duplicateUser) {
      if (duplicateUser.email === self.email) {
        self.invalidate('email', 'Email already exists.');
      }
      if (duplicateUser.phnum === self.phnum) {
        self.invalidate('phnum', 'Phone number already exists.');
      }
      throw new Error('Duplicate value error. You already have an account with this Phone Number or Email!!');
    }
    next();
  } catch (err) {
    next(err);
  }
});

const users_TSF = mongoose.model('users_TSF', users_schema1);
module.exports = users_TSF;
