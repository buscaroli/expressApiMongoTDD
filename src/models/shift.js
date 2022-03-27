const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const { today } = require('../utils/dateFormatter')

const shiftSchema = new Schema({
  where: {
    type: String,
    trim: true,
  },
  when: {
    type: String,
    default: today(),
    trim: true,
  },
  billed: {
    type: Number,
    required: true,
    validate(num) {
      if (num < 0) {
        throw new Error('Amount billed cannot be a negative number.')
      }
    },
  },
  description: {
    type: String,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
})

const Shift = mongoose.model('shift', shiftSchema)

module.exports = Shift
