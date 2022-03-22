// We are creating a separate DB for Testing in order to avoid interfering
// with the production server.
// We are using an IN-Memory database in order to speed up operations

const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const testDB = MongoMemoryServer.create()

// Connect to testing database
module.exports.connectToTestDB = async () => {
  const uri = testDB.getUri()
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
  }
  mongoose.connect(uri, mongooseOptions)
}

// Disconnect from testing database
module.exports.closeTestDB = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await testDB.stop()
}

// Clear testing database and remove data
module.exports.clearTestDB = async () => {
  const collections = mongoose.connection.collections
  for (let key in collections) {
    let collection = collections[key]
    collection.deleteMany()
  }
}
