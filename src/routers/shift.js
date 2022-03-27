const express = require('express')
const Shift = require('../models/shift')
const router = new express.Router()
const auth = require('../middleware/auth')

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

module.exports = router
