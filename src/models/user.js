const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const validator = require('validator')

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate(address) {
      if (!validator.isEmail(address)) {
        throw new Error('Invalid email provided.')
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  joined: {
    type: Date,
    default: Date.now(),
  },
})

const User = mongoose.model('user', userSchema)

module.exports = User
