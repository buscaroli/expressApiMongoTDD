require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const shiftRouter = require('./routers/shift')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(shiftRouter)

app.get('/', (req, res) => {
  res.send(<h1>Shifts API</h1>)
})

module.exports = app
