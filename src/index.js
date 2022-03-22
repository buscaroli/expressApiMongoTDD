require('./db/mongoose')
const express = require('express')
const { json } = require('express/lib/response')
const app = express()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})
