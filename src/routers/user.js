const express = require('express')
const User = require('../models/user')
const router = new express.Router()

// SIGNUP
router.post('/users/signup', async (req, res) => {
  try {
    const user = await new User(req.body)
    await user.save()
    res.status(201).send(user)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
