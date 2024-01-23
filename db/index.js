const pg = require('pg')

const connectionString = process.env.DATABASE_URL

const db = new pg.Pool({
  connectionString: connectionString
})

module.exports = db