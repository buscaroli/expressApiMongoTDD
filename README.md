# expressApiMongoTDD

Implementaion of a simple API using ExpressJS and Mongoose. Using TDD with Jest and Supertest (main learning focus of the project).

## TODO

- Send an email to the user in case password forgotten.
- Implement a Client API (Web and/or Mobile) to easily manage their data.

## Description

I developed and deployed a webserver that allow users to create an account and to manage their work shifts data.

Each shift includes:

- date
- place
- description
- amount billed
- if paid or not (Boolean to toggle from false to true once payment has come through)

### Tech Stack

NodeJS with Express and MongoDB.

### Deployment

Server deployed on Heroku @ https://dashboard.heroku.com/apps/buscaroli-shifts-api .
Database deployed on Mongo Atlas.

### Implementation

Created two separate environments using env-cmd, one environment was used for development and the other for testing.
This allowed testing on a separate database.
A configuration file named .env-cmdrc is kept in /src and looks like this:

```
{
  "dev": {
    "PORT": "3000",
    "DB_HOST": "mongodb+srv://<name>:<password>@main-cluster.tlcwv.mongodb.net/",
    "DB_NAME": "shifts-api-database",
    "JWT_PW": "YourPasswordHere"
  },
  "test": {
    "PORT": "3000",
    "DB_HOST": "mongodb://127.0.0.1:27017/",
    "DB_NAME": "shifts-manager-TEST",
    "JWT_PW": "YourTestPasswordHere"
  }
}
```

In order to be able to test on a separate database I also split the main application file into two separate files:

/src/index.js

```
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})
```

/src/app.js

```
require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const shiftRouter = require('./routers/shift')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(shiftRouter)

app.get('/', (req, res) => {
  res.send('<h1>Shifts API</h1>)})

module.exports = app

```

The database is imported from:

/src/db/mongoose.js

```
const mongoose = require('mongoose')

const databaseName = process.env.DB_NAME || 'temp-db-name'
const databaseHost = process.env.DB_HOST || 'mongodb://localhost:27017/'

mongoose.connect(databaseHost + databaseName)

```

### TDD development with Jest and Supertest.

Files organised unter the /test directory.
Tested:

- /users
- /shifts
- /utils

### Node Server implemented with ExpressJS

Routes under:

- /src/routers/user.js
- /src/routers/shift.js

Utilities (formatting dates) under:

- /src/utils

Custom middleware (authentication) under:

- /src/middleware

### Database implemented with mongodb and Mongoose

Mongoose schemas under:

- /src/models/user.js
- /src/models/shift.js
