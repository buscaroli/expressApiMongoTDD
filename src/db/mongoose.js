const mongoose = require('mongoose')
const databaseName = 'shifts-manager'

const databaseHost = process.env.DB_HOST || 'mongodb://localhost:27017/'

mongoose.connect(databaseHost + databaseName)
