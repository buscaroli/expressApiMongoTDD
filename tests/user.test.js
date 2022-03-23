const request = require('supertest')
const app = require('../src/app')

test('creates an user', async () => {
  await request(app)
    .post('/users/signup')
    .send({
      name: 'Matt',
      email: 'matt@email.com',
      password: 'mattpassword',
    })
    .expect(201)
})
