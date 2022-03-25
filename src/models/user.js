const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const res = require('express/lib/response')

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

// Static Methods - callable on the Class/Model
userSchema.statics.findByEmailAndPassword = async ({ email, password }) => {
  try {
    let user = await User.findOne({ email })
    if (!user) throw new Error({ error: 'Unable to Login.' })

    let matchingPW = await bcrypt.compare(password, user.password)
    if (!matchingPW) throw new Error({ error: 'Wrong credentials.' })

    return user
  } catch (err) {
    throw new Error(err)
  }
}

// Virtual Methods (callable on the instance (eg user.method()))
// Do not use () => {} Fat Arrow functions!!

// return a shorter version of the user that doesn't contain private data (eg password)
userSchema.methods.getMinimalProfile = async function () {
  return { name: this.name, email: this.email, joined: this.joined }
}

// Middleware to hash password using default salts = 10
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

const User = mongoose.model('user', userSchema) // this needs to be here at the end!

module.exports = User
