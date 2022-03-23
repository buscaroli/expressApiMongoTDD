const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const User = require('../src/models/user')

beforeEach(async () => await User.deleteMany())
afterAll(async () => await mongoose.connection.close())

const matt = {
  name: 'Matt',
  email: 'matt@email.com',
  password: 'mattpassword',
}

const john = {
  name: 'John',
  email: 'john@email.com',
  password: 'johnpassword',
}

test('Should create a user', async () => {
  await request(app)
    .post('/users/signup')
    .send(matt)
    .then((res) => {
      expect(res.statusCode).toBe(201)
    })
})

test("Should verify the new User's data", async () => {
  await request(app)
    .post('/users/signup')
    .send(john)
    .then((res) => {
      expect(res.body.name).toBe('John')
      expect(res.body.email).toBe('john@email.com')
      expect(res.body.password).toBe('johnpassword')
      expect(res.body._id).toBeDefined()
      expect(res.body.joined).toBeDefined()
    })
})

test('Should delete a user', async () => {
  // create a User named susan and save it to the db
  const susan = new User({
    name: 'Susan',
    email: 'susan@email.com',
    password: 'susanpassword',
  })
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
