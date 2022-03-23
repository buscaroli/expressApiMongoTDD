const mongoose = require('mongoose')

const databaseName = process.env.DB_NAME || 'temp-db-name'
const databaseHost = process.env.DB_HOST || 'mongodb://localhost:27017/'

mongoose.connect(databaseHost + databaseName)
