const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')

// Every request to the API apart to the endpoints '/users/signup'
// and '/users/login' will require authentication by providing an
// authentication token that will be validated by the server

// Signup new user
router.post('/users/signup', async (req, res) => {
  try {
    const user = await new User(req.body)
    const token = await user.generateAuthToken()
    await user.save()

    res.status(201).send({ user, token })
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

// Login existing user
router.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findByEmailAndPassword({ email, password })
    const token = await user.generateAuthToken()

    // console.log(`route /users/login\n${user}\n${token}`)
    res.send({ user, token })
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

// Logout user from current device
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((item) => {
      return item.token !== req.token
    })
    await req.user.save()

    res.send(req.user)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

// Logout from every device
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()

    res.send(req.user)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

// Get info about current authenticated user
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

// Delete current authenticated user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete({ _id: req.user._id })
    res.send()
  } catch (err) {
    res.status(500).send({ error: err })
  }
  // try {
  //   let id = await req.params.id
  //   // console.log(`the id is ${id}`)
  //   await User.findByIdAndDelete(id)
  //   res.status(200).send()
  // } catch (err) {
  //   res.status(500).send({ error: err })
  // }
})

// Update details of currently authenticated user
router.patch('/users/me', auth, async (req, res) => {
  const id = await req.params.id

  // Check all updates are allowed (eg updating id or timestamp disallowed)
  const allowedUpdates = ['name', 'email', 'password']
  const updates = Object.keys(req.body)
  const isValid = updates.every((prop) => allowedUpdates.includes(prop))

  if (!isValid) {
    return res.status(400).send({ error: 'Opration not allowed.' })
  }

  try {
    updates.forEach((prop) => {
      req.user[prop] = req.body[prop]
    })
    await req.user.save()

    res.send(req.user)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

module.exports = router
