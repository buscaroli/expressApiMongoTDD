// const mongoose = require('mongoose')

const User = require('../models/user')
const userRouter = require('../routers/user')
const db = require('../db/mongooseTestDB') // testing DB
const { request } = require('express')

beforeAll(() => db.connectToTestDB())

afterEach(() => db.clearTestDB())

afterAll(() => db.closeTestDB())

describe('Testing CRUD operations', () => {
  it('creates an user', async (done) => {
    const res = await request.post('/signup').send({
      name: 'Matt',
      email: 'matt@email.com',
      password: 'mattpassword',
    })

    const user = await User.findOne({ email: 'matt@email.com' })

    expect(user.name).toEqual('Matt')
    expect(user.email).toEqual('matt@email.com')
    expect(user.password).toEqual('mattpassword')

    done()
  })
})
