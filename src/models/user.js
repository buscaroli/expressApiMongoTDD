const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
        throw new Error({ error: 'Invalid email provided.' })
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
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

// generate a json-webtoken for auth purposes
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_PW)

  this.tokens = this.tokens.concat({ token })
  await this.save()

  return token
}

// Middleware to hash password using default salts = 10
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

// Removed as not working, middleware was ignored
// // When deleting user, also delete all his shifts
// userSchema.pre('findByIdAndDelete', async function (next) {
//   await Shift.deleteMany({ owner: this._id })
//   console.log('--------- running the delete pre middleware')
//   next()
// })

const User = mongoose.model('user', userSchema) // this needs to be here at the end!

module.exports = User
