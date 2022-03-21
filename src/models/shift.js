const { Schema } = require('mongoose')
const validator = require('validator')
const today = require('../utils/dateFormatter')

const shiftSchema = new Schema({
  where: {
    type: String,
    trim: true,
  },
  when: {
    type: Date,
    default: today(),
    trim: true,
  },
  where: {
    type: String,
  },
  billed: {
    type: Number,
    required: true,
    validate(num) {
      if (number < 0) {
        throw new Error('Amount billed cannot be a negative number.')
      }
    },
  },
  description: {
    type: String,
  },
})

const Shift = mongoose.model('Shift', shiftSchema)

module.exports = Shift
