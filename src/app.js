require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const shiftRouter = require('./routers/shift')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(shiftRouter)

module.exports = app
