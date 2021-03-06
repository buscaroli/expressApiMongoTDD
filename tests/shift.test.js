const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const Shift = require('../src/models/shift')
const User = require('../src/models/user')

// deleting all users and shifts from database before running test suite
beforeEach(async () => {
  await User.deleteMany()
  await Shift.deleteMany()
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

test('Should allow a user to modify one of his shifts', async () => {
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

  // modify the 'where' property of the shift and test its status code
  await request(app)
    .patch(`/shifts/${mattShift._id}`)
    .set('Authorization', 'Bearer ' + token)
    .send({ where: 'Bransgore' })
    .expect(200)

  // find the modified shift by its modified 'where' property and test its
  // 'billed' property
  const shiftRes2 = await Shift.findOne({ where: 'Bransgore' })
  expect(shiftRes2.billed).toBe(205)
})

test('Should not allow to modify a property not in the "allowed" array of the route', async () => {
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

  // modify the 'where' property of the shift and test its status code
  await request(app)
    .patch(`/shifts/${mattShift._id}`)
    .set('Authorization', 'Bearer ' + token)
    .send({ _id: 'ThisIsJustAMadeUpID' })
    .expect(400)
})

test('Should retrieve a note from an authorized user', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create two shifts
  const mattShift = new Shift({
    where: 'Bournemouth',
    billed: 180,
    description: 'Worked 7 hours in the town centre',
    owner: matt._id,
  })
  await mattShift.save()

  const mattShift2 = new Shift({
    where: 'Poole',
    billed: 210,
    description: 'Worked 8 hours in Hamworthy',
    owner: matt._id,
  })
  await mattShift2.save()

  //get one of the shifts by Id and check status code
  await request(app)
    .get(`/shifts/${mattShift._id}`)
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(200)
})

test('Should not return the shift if user in unauthorized', async () => {
  // create a user without authorization and save to the db
  const matt = await new User(userOne)
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Bournemouth',
    billed: 180,
    description: 'Worked 7 hours in the town centre',
    owner: matt._id,
  })
  await mattShift.save()

  //get one of the shifts by Id and check status code 401 'Unauthorized'
  await request(app)
    .get(`/shifts/${mattShift._id}`)
    .set('Authorization', 'Bearer ' + 'justARandomTokenThatDoesNothing')
    .send()
    .expect(401)
})

test('Should not return a nonexistent shift', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Bournemouth',
    billed: 180,
    description: 'Worked 7 hours in the town centre',
    owner: matt._id,
  })
  await mattShift.save()

  //try to find a shift by Id, using a wrong ID, and check status code
  // 404 Not Found
  const wrongID = '624190246a996f1176803622'
  await request(app)
    .get(`/shifts/${wrongID}`) // hardcoded and non existent id)
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(404)
})

test('Should delete users shifts when deleting user', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Wimborne',
    billed: 190,
    description: 'Worked 8 hours, paid lunch cover',
    owner: matt._id,
  })
  await mattShift.save()

  const shiftID = mattShift._id

  // delete the user matt and test for status code 200 OK
  await request(app)
    .delete(`/users/me`)
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(200)

  // look for the shift of the deleted user and test that it is not stored
  // in the db anymore
  const deletedShift = await Shift.findById(shiftID)
  expect(deletedShift).toBe(null)
})

test('Should return all the shifts of the authenticated user', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Wimborne',
    billed: 190,
    description: 'Worked 8 hours, paid lunch cover',
    owner: matt._id,
  })
  await mattShift.save()

  // create a second shift
  const mattShift2 = new Shift({
    where: 'Poole',
    billed: 200,
    description: 'Worked 9 hours, paid lunch cover',
    owner: matt._id,
    paid: true,
  })
  await mattShift2.save()

  // create a third shift
  const mattShift3 = new Shift({
    where: 'Southbourne',
    billed: 230,
    description: 'Worked 9 hours',
    owner: matt._id,
  })
  await mattShift3.save()

  // request all the shifts through the endpoint and expect a
  // respomnse status of 200 OK
  await request(app)
    .get('/shifts')
    .set('Authorization', 'Bearer ' + token)
    .send()
    .expect(200)

  // test that all three shifts can be found
  const mattShifts = await Shift.find({ owner: matt._id })
  expect(mattShifts.length).toBe(3)
})

test('Should return only the unpaid shifts of the authenticated user', async () => {
  // create a user, authorize it and save to the db
  const matt = await new User(userOne)
  const token = await matt.generateAuthToken()
  await matt.save()

  // create a shift
  const mattShift = new Shift({
    where: 'Wimborne',
    billed: 190,
    description: 'Worked 8 hours, paid lunch cover',
    owner: matt._id,
  })
  await mattShift.save()

  // create a second shift
  const mattShift2 = new Shift({
    where: 'Poole',
    billed: 200,
    description: 'Worked 9 hours, paid lunch cover',
    owner: matt._id,
    paid: true,
  })
  await mattShift2.save()

  // create a third shift
  const mattShift3 = new Shift({
    where: 'Southbourne',
    billed: 230,
    description: 'Worked 9 hours',
    owner: matt._id,
  })
  await mattShift3.save()

  // request all unpaid shifts through the endpoint and expect a
  // response status of 200 OK and that only 2 shifts are found
  const response = await request(app)
    .get('/shifts')
    .set('Authorization', 'Bearer ' + token)
    .send({ ...userOne, select: 'unpaid' })
    .expect(200)

  expect(response.body.length).toBe(2)
})
