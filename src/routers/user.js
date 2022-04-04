const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const Shift = require('../models/shift')

// Every request to the API apart to the endpoints '/users/signup'
// and '/users/login' will require authentication by providing an
// authentication token that will be validated by the server

// Signup new user
router.post('/users/signup', async (req, res) => {
  try {
    const user = await new User(req.body)
    const token = await user.generateAuthToken()
    await user.save()

    const minProfile = await user.getMinimalProfile()
    res.status(201).send({ user: minProfile, token })
  } catch (err) {
    res.status(500).send(err)
  }
})

// Login existing user
router.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findByEmailAndPassword({ email, password })
    const token = await user.generateAuthToken()

    const minProfile = await user.getMinimalProfile()
    res.send({ user: minProfile, token })
  } catch (err) {
    res.status(500).send(err)
  }
})

// Logout user from current device
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((item) => {
      return item.token !== req.token
    })
    await req.user.save()

    const minProfile = await req.user.getMinimalProfile()
    res.send(minProfile)
  } catch (err) {
    res.status(500).send(err)
  }
})

// Logout from every device
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()

    const minProfile = await req.user.getMinimalProfile()
    res.send(minProfile)
  } catch (err) {
    res.status(500).send(err)
  }
})

// Get info about current authenticated user
router.get('/users/me', auth, async (req, res) => {
  const minProfile = await req.user.getMinimalProfile()
  res.send(minProfile)
})

// Delete current authenticated user
// NB all of the user's shifts will also be deleted thanks to a
// mongoose middleware located @ src/models/user.js
router.delete('/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    await Shift.deleteMany({ owner: user._id })
    await user.remove()

    res.send()
  } catch (err) {
    res.status(500).send(err)
  }
})

// Update details of currently authenticated user
router.patch('/users/me', auth, async (req, res) => {
  const id = await req.params.id

  // Check all updates are allowed (eg updating id or timestamp disallowed)
  const allowedUpdates = ['name', 'email', 'password']
  const updates = Object.keys(req.body)
  const isValid = updates.every((prop) => allowedUpdates.includes(prop))

  if (!isValid) {
    return res.status(400).send('Opration not allowed.')
  }

  try {
    updates.forEach((prop) => {
      req.user[prop] = req.body[prop]
    })
    await req.user.save()

    const minProfile = await req.user.getMinimalProfile()
    res.send(minProfile)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
