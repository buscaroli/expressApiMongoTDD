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

router.post('/users/login', async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findByEmailAndPassword({ email, password })
    res.send()
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    let id = await req.params.id
    // console.log(`the id is ${id}`)
    await User.findByIdAndDelete(id)
    res.status(200).send()
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

router.patch('/users/:id', async (req, res) => {
  const id = await req.params.id

  // Check all updates are allowed (eg updating id or timestamp disallowed)
  const allowedUpdates = ['name', 'email', 'password']
  const updates = Object.keys(req.body)
  const isValid = updates.every((prop) => allowedUpdates.includes(prop))

  if (!isValid) {
    return res.status(400).send({ error: 'Opration not allowed.' })
  }

  try {
    const newUser = await User.findById(id)
    updates.forEach((prop) => {
      newUser[prop] = req.body[prop]
    })
    await newUser.save()

    res.status(200).send(newUser)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

module.exports = router
