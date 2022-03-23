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

router.delete('/users/:id', async (req, res) => {
  try {
    let id = await req.params.id
    // console.log(`the id is ${id}`)
    await User.findByIdAndDelete(id)
    res.status(200).send()
  } catch (err) {
    throw new Error(err)
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
    // find the user by ID and update its details
    // let newUser = await User.findByIdAndUpdate(id, req.body)

    const newUser = await User.findById(id)
    updates.forEach((prop) => {
      newUser[prop] = req.body[prop]
    })
    await newUser.save()

    console.log(newUser)
    res.status(200).send(newUser)
  } catch (err) {
    throw new Error(err)
  }
})

module.exports = router
