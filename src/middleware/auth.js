const jwt = require('jsonwebtoken')
const User = require('../models/user')

// authentication
// check if client has a valid token (is authenticated)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.JWT_PW)

    // find user with correct id that has the authentication token still stored
    const user = await User.findOne({
      _id: decodedToken._id,
      'tokens.token': token,
    })

    if (!user) {
      throw new Error() // will trigger the catch code below
    }

    // if the client was successfully authenticated we can send the user back
    // by adding it to the req property (so it is accessible via req.user)
    req.user = user

    // adding token so we can easily logout user at endpoint '/users/logout'
    req.token = token

    next()
  } catch (err) {
    res.status(401).send({ error: err })
  }
}

module.exports = auth
