const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const Shift = require('../src/models/shift')
const User = require('../src/models/user')

// deleting all users and shifts from database before running test suite
beforeEach(async () => {
  await User.deleteMany()
  await Shift.deleteMany()
  return
})

// closing database connection after running testing suite
afterAll(async () => await mongoose.connection.close())

const userOne = {
  name: 'Matt',
  email: 'matt@email.com',
  password: 'mattpassword',
}

test('Should create a new shift', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift using the /shifts/add endpoint, sending
  // matts id and auth token
  const mattShift = await request(app)
    .post('/shifts/add')
    .set('Authorization', 'Bearer ' + token)
    .send({
      where: 'Lymington',
      billed: 205,
      description: 'Worked 8 hours, lunch unpaid, £5 parking',
      owner: matt._id,
    })

  // find the shift by its 'where' property and test that the owner property
  // matches the user's id
  const shift = await Shift.findOne({ where: 'Lymington' })
  expect(shift.owner).toEqual(matt._id)
})

test('Should delete a shift', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Lymington',
    billed: 205,
    description: 'Worked 8 hours, lunch unpaid, £5 parking',
    owner: matt._id,
  })
  await mattShift.save()

  // find the shift by its 'where' property and test that the property 'billed'
  // is correct
  const shiftRes = await Shift.findOne({ where: 'Lymington' })
  expect(shiftRes.billed).toBe(205)

  // delete the shift and test for 200 OK status
  await request(app)
    .delete(`/shifts/${mattShift._id.toString()}`)
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(200)

  // try to delete the already deleted test and test for 404 Not Found status
  await request(app)
    .delete(`/shifts/${mattShift._id.toString()}`)
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(404)
})
