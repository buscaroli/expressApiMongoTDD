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

router.patch('/shifts/:id', auth, async (req, res) => {
  const _id = req.params.id

  const allowedUpdates = ['where', 'when', 'billed', 'description', 'paid']
  const updates = Object.keys(req.body)
  const isValid = updates.every((prop) => allowedUpdates.includes(prop))

  if (!isValid) {
    return res.status(400).send({ error: 'Operation not allowed.' })
  }

  try {
    const shift = await Shift.findById(_id)
    updates.forEach((prop) => {
      shift[prop] = req.body[prop]
    })
    await shift.save()

    res.send(shift)
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

router.get('/shifts/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const shift = await Shift.findById(_id)
    if (!shift) {
      res.status(404).send({ result: 'Shift not found.' })
    } else {
      res.send(shift)
    }
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

module.exports = router
