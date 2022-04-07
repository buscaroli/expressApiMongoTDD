const express = require('express')
const Shift = require('../models/shift')
const router = new express.Router()
const auth = require('../middleware/auth')
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

// Delete a shift
router.delete('/shifts/', auth, async (req, res) => {
  let _id = req.body._id

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

// Update/Patch a shift
router.patch('/shifts/', auth, async (req, res) => {
  const _id = req.body._id

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

// get a single shift
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

// get all of the user's shifts
router.get('/shifts', auth, async (req, res) => {
  // if the request body contains a property called select which equals to
  // 'unpaid' we will only search for the shifts whose paid property is false
  try {
    let shifts = await Shift.find({ owner: req.user._id })

    if (req.body.select !== undefined && req.body.select === 'unpaid') {
      let unpaidShifts = shifts.filter((shift) => shift.paid === false)
      res.send(unpaidShifts)
    } else {
      res.send(shifts)
    }
  } catch (err) {
    res.status(500).send({ error: err })
  }
})

module.exports = router
