require('./db/mongoose')
const express = require('express')
const cors = require('cors')
const userRouter = require('./routers/user')
const shiftRouter = require('./routers/shift')

const app = express()

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(shiftRouter)

app.get('/', (req, res) => {
  res.send(
    '<h1>Shifts API</h1><h4><a href="https://github.com/buscaroli/expressApiMongoTDD" target="_blank" >Open on GitHub</a></h4>'
  )
})

module.exports = app
