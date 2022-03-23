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

test('creates an user', async () => {
  await request(app)
    .post('/users/signup')
    .send(matt)
    .then((res) => {
      expect(res.statusCode).toBe(201)
    })
})
