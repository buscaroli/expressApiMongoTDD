const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const User = require('../src/models/user')
const bcrypt = require('bcrypt')

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

const userAuth = {
  name: 'George',
  email: 'george@email.com',
  password: 'georgepassword',
}

test('Should create a user', async () => {
  let res = await request(app).post('/users/signup').send(userOne)
  expect(res.statusCode).toBe(201)
})

test('Should NOT create a user if already present in the database', async () => {
  await request(app).post('/users/signup').send(userOne)

  const res = await request(app).post('/users/signup').send(userOne)

  expect(res.statusCode).not.toBe(201)
})

test("Should verify the new User's data", async () => {
  const newUser = await request(app).post('/users/signup').send(userTwo)

  expect(newUser.body.user.name).toBe('John')
  expect(newUser.body.user.email).toBe('john@email.com')
  expect(newUser.body.user.password).not.toBe('johnpassword') // pw hashed by middleware
  expect(newUser.body.user._id).toBeDefined()
  expect(newUser.body.user.joined).toBeDefined()
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
    .send({
      name: 'Matteo',
      email: 'matteo@email.com',
      password: 'matteoPassword',
    })
    .expect(200)

  // find a user with matt's previously saved id
  const updatedUser = await User.findById(mattID)

  expect(updatedUser.name).toBe('Matteo')
})

test('Should find a user by email and password', async () => {
  let john = new User(userTwo)
  await john.save()

  let user = await User.findByEmailAndPassword({
    email: 'john@email.com',
    password: 'johnpassword',
  })
  expect(john.name).toBe(user.name)
})

test('Should login a user with correct credentials', async () => {
  let susan = new User(userThree)
  await susan.save()

  let res = await request(app).post('/users/login').send(userThree)

  expect(res.statusCode).toBe(200)
})

test('Should Not login a user with wrong credentials', async () => {
  let susan = new User(userThree)
  await susan.save()

  let res = await request(app).post('/users/login').send({
    name: 'Susan',
    email: 'susan@email.com',
    password: 'WRONGpassword',
  })
  expect(res.statusCode).not.toBe(200)
})

test('Should allow an authenticated user to access their data', async () => {
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  const firstRes = await request(app)
    .post('/users/login')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  // console.log('firstRes status: ', firstRes.status)
  expect(firstRes.status).toBe(200)

  const secondRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  // console.log('secondRes status: ', secondRes.status)
  expect(secondRes.status).toBe(200)
})

test('Should not allow a user to access data if not authenticated', async () => {
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  const firstRes = await request(app)
    .post('/users/login')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  // console.log('firstRes status: ', firstRes.status)
  expect(firstRes.status).toBe(200)

  const secondRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + 'madeUpToken.lsakdladklasdk')
    .send(userAuth)

  // console.log('secondRes status: ', secondRes.status)
  expect(secondRes.status).not.toBe(200)
})

test('Should logout authenticated user', async () => {
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  const firstRes = await request(app)
    .post('/users/login')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  // console.log('firstRes status: ', firstRes.status)
  expect(firstRes.status).toBe(200)

  const secondRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  // console.log('secondRes status: ', secondRes.status)
  expect(secondRes.status).toBe(200)

  let tokensNumber = george.tokens.length
  // console.log(`Tokens number: ${tokensNumber}`)
  // console.log('***', george.tokens)

  const thirdRes = await request(app)
    .post('/users/logout')
    .set('Authorization', 'Bearer ' + 'dfdfddfdfd')
    .send(userAuth)

  // console.log('*****', george.tokens)
  expect(thirdRes.status).toBe(401)
})
