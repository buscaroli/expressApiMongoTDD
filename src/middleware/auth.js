const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '')
  console.log(token)

  next()
}
