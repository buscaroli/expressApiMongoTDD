const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')

afterAll(() => mongoose.connection.close())

test('creates an user', async () => {
  await request(app)
    .post('/users/signup')
    .send({
      name: 'Matt',
      email: 'matt@email.com',
      password: 'mattpassword',
    })
    .then((res) => {
      expect(res.statusCode).toBe(201)
    })
})
