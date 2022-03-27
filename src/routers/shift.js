const express = require('express')
const Shift = require('../models/shift')
const router = new express.Router()
const auth = require('../middleware/auth')
const { request } = require('../app')
const res = require('express/lib/response')

// Add a new shift
router.post('/shifts/add', auth, async (req, res) => {
  try {
    // the owner field id the user's id, which we can get from the
    // authenticated user through req.user (user was added to the req
    // property during the call to the auth function in src/middleware)
    const shift = await new Shift({ ...req.body, owner: req.user._id })
    await shift.save()
    res.status(201).send(shift)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

router.delete('/shifts/:id', auth, async (req, res) => {
  let _id = req.params.id

  try {
    const shift = await Shift.findByIdAndDelete({ _id })

    if (shift) {
      res.send(shift)
    } else {
      res.status(404).send({ error: 'Shift not found.' })
    }
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

module.exports = router
