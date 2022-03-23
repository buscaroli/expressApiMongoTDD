const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const User = require('../src/models/user')

beforeEach(async () => await User.deleteMany())
afterAll(async () => await mongoose.connection.close())

const userOne = {
  name: 'Matt',
  email: 'matt@email.com',
  password: 'mattpassword',
}

const userTwo = {
  name: 'John',
  email: 'john@email.com',
  password: 'johnpassword',
}

const userThree = {
  name: 'Susan',
  email: 'susan@email.com',
  password: 'susanpassword',
}

test('Should create a user', async () => {
  await request(app)
    .post('/users/signup')
    .send(userOne)
    .then((res) => {
      expect(res.statusCode).toBe(201)
    })
})

test("Should verify the new User's data", async () => {
  const newUser = await request(app).post('/users/signup').send(userTwo)

  expect(newUser.body.name).toBe('John')
  expect(newUser.body.email).toBe('john@email.com')
  expect(newUser.body.password).toBe('johnpassword')
  expect(newUser.body._id).toBeDefined()
  expect(newUser.body.joined).toBeDefined()
})

test('Should delete a user', async () => {
  // create a User named susan and save it to the db
  const susan = new User(userThree)
  await susan.save()
  let susanID = susan._id.toString()

  // find the user to be sure record has been created
  const newUser = await User.findById(susanID)
  expect(newUser._id.toString()).toBe(susanID)

  // delete the user
  await request(app).delete(`/users/${susanID}`).send().expect(200)

  // confirm record has been deleted
  const deletedUser = await User.findById(susanID)
  expect(deletedUser).toBe(null)
})

test('Should update a user name', async () => {
  // create and save a user named matt
  const matt = new User(userOne)
  await matt.save()
  let mattID = matt._id.toString()

  // update the user's name using the PATCH method
  await request(app)
    .patch(`/users/${mattID}`) // <- do not use '/users/:id' here!! :O
    .send({ name: 'Matteo', email: 'matteo@email.com' })
    .expect(200)

  // find a user with matt's previously saved id
  const updatedUser = await User.findById(mattID)

  expect(updatedUser.name).toBe('Matteo')
})
