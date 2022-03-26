const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const User = require('../src/models/user')
const bcrypt = require('bcrypt')
const { send } = require('express/lib/response')

// deleting all users from database before running test suite
beforeEach(async () => await User.deleteMany())

// closing database connection after running testing suite
afterAll(async () => await mongoose.connection.close())

///////////////////////////////////
// user objects used during testing
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

///////////////////////////////////

test('Should create a user', async () => {
  // adding a user to the database and testing server response
  let res = await request(app).post('/users/signup').send(userOne)
  expect(res.statusCode).toBe(201)
})

test('Should NOT create a user if already present in the database', async () => {
  // adding a user to the database using the /users/signup endpoint
  await request(app).post('/users/signup').send(userOne)

  // trying to add a user with same email to the database and testing for failure
  const res = await request(app).post('/users/signup').send(userOne)
  expect(res.statusCode).not.toBe(201)
})

test("Should verify the new User's data", async () => {
  // adding a user to the database using the /users/signup endpoint
  const newUser = await request(app).post('/users/signup').send(userTwo)

  // testing the user s properties are as expected
  expect(newUser.body.user.name).toBe('John')
  expect(newUser.body.user.email).toBe('john@email.com')
  expect(newUser.body.user.password).not.toBe('johnpassword') // pw hashed by middleware
  expect(newUser.body.user._id).toBeDefined()
  expect(newUser.body.user.joined).toBeDefined()
})

test('Should delete a user', async () => {
  // create a User named George and save it to the db
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // deleting george
  await request(app)
    .delete('/users/me')
    .set('Authentication', 'Bearer ' + token)
    .send(userAuth)

  // testing the user cannot be found
  const response = await User.findById(george._id)
  expect(response.status).toBe(undefined)
})

test('Should find a user using a custom Mongoose statics)', async () => {
  // adding a user to the database using the userTwo object
  let john = new User(userTwo)
  await john.save()

  // testing it is possible to find a user with the custom statics
  // findByEmailAndPassword() that can be founs in src/models/user.js
  let user = await User.findByEmailAndPassword({
    email: 'john@email.com',
    password: 'johnpassword',
  })
  expect(john.name).toBe(user.name)
})

test('Should login a user with correct credentials', async () => {
  // adding a user to the database using the userThree object
  let susan = new User(userThree)
  await susan.save()

  // testing it will log the user in with correct credentials
  let res = await request(app).post('/users/login').send(userThree)
  expect(res.statusCode).toBe(200)
})

test('Should Not login a user with wrong credentials', async () => {
  // adding a user to the database using the userThree object
  let susan = new User(userThree)
  await susan.save()

  // testing it will not log the user in with wrong credentials
  let res = await request(app).post('/users/login').send({
    name: 'Susan',
    email: 'susan@email.com',
    password: 'WRONGpassword',
  })
  expect(res.statusCode).not.toBe(200)
})

test('Should allow an authenticated user to access their data', async () => {
  // creating a user and adding auth token
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // testing it is possible to get user data if authenticated
  const firstRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  expect(firstRes.status).toBe(200)
})

test('Should not allow a user to access data if not authenticated', async () => {
  // creating a user and adding an auth token
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // testing it is not possible to login without a valid token
  const secondRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + 'madeUpToken.lsakdladklasdk')
    .send(userAuth)

  expect(secondRes.status).not.toBe(200)
})

test('Should logout authenticated user', async () => {
  // creating a user and adding an authentication token
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // testing it is possible to log in to get auth user details
  const secondRes = await request(app)
    .get('/users/me')
    .set('Authorization', 'Bearer ' + token)
    .send(userAuth)

  expect(secondRes.status).toBe(200)

  // logging out and testing it is not possible to get user details
  const thirdRes = await request(app)
    .post('/users/logout')
    .set('Authorization', 'Bearer ' + 'dfdfddfdfd')
    .send(userAuth)

  expect(thirdRes.status).toBe(401)
})

test('Should logout from all devices', async () => {
  // creating a user and adding an authentication token
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // // generating an extra token, not necessary, just trying it works
  // const token2 = await george.generateAuthToken()

  // logging out from all devices by deleting all tokens
  await request(app)
    .post('/users/logoutAll')
    .set('Authorization', 'Bearer ' + token) // can use token2
    .send(userAuth)

  // finding the user through georges id
  const response = await User.findById(george._id)

  // testing that the tokens array is empty
  expect(response.tokens.length).toBe(0)
})

test('Should modify the user properties', async () => {
  // creating a user and adding an authentication token
  const george = await new User(userAuth)
  const token = await george.generateAuthToken()
  await george.save()

  // saving old password before the update
  const georgeOldEmail = george.email

  // updating allowed properties through the /users/me endpoint
  await request(app)
    .patch('/users/me')
    .set('Authorization', 'Bearer ' + token)
    .send({ name: 'CantStandYa', email: 'masterof@yourdomain.org' })

  // finding the updated user
  const response = await User.findById(george._id)

  // testing properties have changed
  expect(response.email).not.toBe(georgeOldEmail)
  expect(response.email).toBe('masterof@yourdomain.org')
})
